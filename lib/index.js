/**
 * dsh-plugin-chuhai — 自媒体出海 for DeepSeek Harness.
 *
 * One skill, `zimeiti-chuhai`, loaded when the user says 自媒体出海 / AI全球自媒体.
 * Two tools that hand the model a book one part at a time (DSH trims tool results
 * past 8192 characters, both books are longer than that):
 *   - `chuhai_main_book`: the first half, shipped inside this package (public).
 *   - `chuhai_book`: the second half, fetched from dsh.chuhai.express with the key
 *     this plugin carries; no network traffic unless it is called.
 * No keys of the user's, nothing collected, nothing written outside the workspace.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'chuhai';
export const inject = ['skills', 'tools'];

const SKILL_NAME = 'zimeiti-chuhai';
const DEFAULT_BOOK_URL = 'https://dsh.chuhai.express/book';
const MARKER = '::ILANG::v5.0::ENGINEERING_BOOK';
const PART_LIMIT = 8000;          // stay under the 8192-character tool-result trim
const CACHE_MS = 10 * 60 * 1000;  // the remote book is fetched once per ten minutes
const VERSION = readVersion();

function here() {
  return path.dirname(fileURLToPath(import.meta.url));
}

function pkgRoot() {
  return path.join(here(), '..');
}

function readVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(pkgRoot(), 'package.json'), 'utf8')).version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function mainBookPath() {
  return path.join(pkgRoot(), 'books', 'ai-global-media', 'BOOK.md');
}

export function posterPath() {
  return path.join(pkgRoot(), 'books', 'ai-global-media', 'poster.jpg');
}

/** A file shipped next to the main book (posters, the second lens card). */
export function companionPath(file) {
  return path.join(pkgRoot(), 'books', 'ai-global-media', file);
}

/** The skill body ships as a Markdown file so it can be read and edited as text. */
export function skillContent() {
  return fs.readFileSync(path.join(pkgRoot(), 'skills', SKILL_NAME + '.md'), 'utf8');
}

export function normalize(config = {}) {
  const bookUrl = typeof config.bookUrl === 'string' && config.bookUrl ? config.bookUrl : DEFAULT_BOOK_URL;
  if (!/^https:\/\//.test(bookUrl)) throw new Error('chuhai: bookUrl must be https');
  const pass = typeof config.pass === 'string' ? config.pass : '';
  const timeoutMs = Number(config.timeoutMs ?? 30_000);
  return { bookUrl, pass, timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30_000 };
}

/* ---------- book splitting ---------- */

/** Split an iLang engineering book into head / modules / tail by its top-level blocks. */
export function splitBook(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('::') && !l.startsWith(MARKER)) starts.push(i);
  }
  const blocks = starts.map((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1] : lines.length;
    const header = lines[s];
    const m = /^::([A-Z]+)\{([^|}]*)/.exec(header);
    return { kind: m ? m[1] : 'BLOCK', id: m ? m[2].trim() : header.slice(2, 40), start: s, end, text: lines.slice(s, end).join('\n').replace(/\n+$/, '') };
  });
  const firstModule = blocks.findIndex((b) => b.kind === 'MODULE');
  const lastModule = blocks.map((b) => b.kind).lastIndexOf('MODULE');
  const preamble = lines.slice(0, blocks.length ? blocks[0].start : lines.length).join('\n').replace(/\n+$/, '');
  const headBlocks = firstModule < 0 ? blocks : blocks.slice(0, firstModule);
  const modules = firstModule < 0 ? [] : blocks.slice(firstModule, lastModule + 1).filter((b) => b.kind === 'MODULE');
  const tailBlocks = firstModule < 0 ? [] : blocks.slice(lastModule + 1);
  const head = [preamble, ...headBlocks.map((b) => b.text)].filter(Boolean).join('\n\n');
  const tail = tailBlocks.map((b) => b.text).join('\n\n');
  const title = (/^\[ID:([^\]]+)\]/m.exec(text) || [])[1] || '';
  const version = (/^\[VERSION:([^\]]+)\]/m.exec(text) || [])[1] || '';
  return { title, version, head, modules, tail, chars: text.length };
}

function moduleTitle(b) {
  const m = /\|title:([^|}]*)/.exec(b.text.split('\n')[0]);
  return m ? m[1].trim() : '';
}

/** 分页：text 不超过 PART_LIMIT 返回单页；否则按行切成多页，切点只在 :: 开头的行之前或空行处。 */
export function pages(text) {
  if (text.length <= PART_LIMIT) return [text];
  const lines = text.split('\n');
  const out = [];
  let cur = [];
  let curLen = 0;
  const flush = () => { if (cur.length) { out.push(cur.join('\n')); cur = []; curLen = 0; } };
  for (const line of lines) {
    const lineLen = line.length + 1;
    const isBoundary = line.startsWith('::') || line.trim() === '';
    if (cur.length && curLen + lineLen > PART_LIMIT) {
      if (isBoundary) {
        flush();
      } else {
        // 找最后一行空行当切点：它之前成页，它和它之后的行开新页
        let k = cur.length - 1;
        while (k >= 0 && cur[k].trim() !== '') k--;
        if (k >= 0) {
          const carry = cur.slice(k);
          cur = cur.slice(0, k);
          flush();
          cur = carry.slice();
          curLen = carry.reduce((a, l) => a + l.length + 1, 0);
        } else {
          // 一个块本身就超过上限：块内按行硬切，上一页末尾留标记
          out.push(cur.join('\n') + '\n[chuhai: 本页在块中间切开 下一页接着]');
          cur = [];
          curLen = 0;
        }
      }
    }
    cur.push(line);
    curLen += lineLen;
  }
  flush();
  return out;
}

export function toc(book, extra = []) {
  const out = [];
  out.push(`书：${book.title || '?'}  版本 ${book.version || '?'}  共 ${book.chars} 字符；一次取一段，part 填下面的名字。`);
  const headPages = pages(book.head);
  const headInfo = headPages.length > 1 ? `，${headPages.length} 页 head#1 到 head#${headPages.length}` : '';
  out.push(`- head  （${book.head.length} 字符${headInfo}）：角色、目标、边界、规矩。先读它。`);
  for (const b of book.modules) {
    const t = moduleTitle(b);
    const ps = pages(b.text);
    const pageInfo = ps.length > 1 ? `，${ps.length} 页 ${b.id}#1 到 ${b.id}#${ps.length}` : '';
    out.push(`- ${b.id}  （${b.text.length} 字符${pageInfo}）${t ? '：' + t : ''}`);
  }
  const tailPages = pages(book.tail);
  const tailInfo = tailPages.length > 1 ? `，${tailPages.length} 页 tail#1 到 tail#${tailPages.length}` : '';
  out.push(`- tail  （${book.tail.length} 字符${tailInfo}）：验收项（RUBRIC）、兜底（FALLBACK）、优先级。每一环做完对照一次。`);
  for (const line of extra) out.push(line);
  out.push('顺序：head → 模块按列出的次序 → tail。');
  return out.join('\n');
}

export function part(book, which) {
  const w = String(which || 'toc').trim();
  if (w === 'toc') return null;
  const hashIdx = w.indexOf('#');
  const base = (hashIdx < 0 ? w : w.slice(0, hashIdx)).trim();
  const pageNo = hashIdx < 0 ? null : parseInt(w.slice(hashIdx + 1).trim(), 10);
  let full;
  if (base === 'head') full = book.head;
  else if (base === 'tail') full = book.tail;
  else {
    const b = book.modules.find((x) => x.id === base || x.id.toLowerCase() === base.toLowerCase());
    full = b ? b.text : undefined;
  }
  if (full === undefined) {
    const ids = book.modules.map((x) => x.id).join('、');
    throw new Error(`chuhai: 没有叫「${w}」的段。可取的是 toc、head、tail 和模块：${ids}`);
  }
  const ps = pages(full);
  if (pageNo !== null) {
    if (!Number.isInteger(pageNo) || pageNo < 1 || pageNo > ps.length) {
      throw new Error(`chuhai: 没有第 ${pageNo} 页。可取的是 ${base}#1 到 ${base}#${ps.length}。`);
    }
    return ps[pageNo - 1];
  }
  if (ps.length > 1) return ps[0] + `\n[chuhai: 这段共 ${ps.length} 页 接着取 ${base}#2]`;
  return ps[0];
}

function render(text, name) {
  if (text.length > PART_LIMIT) {
    return text.slice(0, PART_LIMIT) + `\n\n[chuhai: ${name} 超过 ${PART_LIMIT} 字符，这里截断了；请按 toc 一段一段取]`;
  }
  return text;
}

/* ---------- the shipped first half ---------- */

export function mainBookText() {
  return fs.readFileSync(mainBookPath(), 'utf8');
}

export function mainBookDefinition() {
  return {
    name: 'chuhai_main_book',
    description: '取「自媒体出海」前半段的工程书（AI全球自媒体：装写作专家、接内容源、建知识库、出文章、公众号走通）。书随插件带着，不走网络。先 part=toc 看目录，再按段取：head、各模块、tail。只在 zimeiti-chuhai 技能让你取的时候调用。',
    parameters: {
      type: 'object',
      properties: { part: { type: 'string', description: 'toc（目录，默认）、head、tail，或模块名（如 PERSONA）；多页时写 段名#页号' } },
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', properties: { content: { type: 'array', items: {} } }, required: ['content'], additionalProperties: false },
      render(_args, value) { return value.content; },
    },
    async execute(args) {
      const book = splitBook(mainBookText());
      const which = args?.part;
      const extra = [
        `- 写作专家包（第一环用：人格正文在 agents 下，四个技能在 skills 下，来源与哈希在 SOURCE.json）在：${companionPath('expert')}`,
        `- 海报（第二环 生财三天体验卡）在：${posterPath()}`,
        `- 海报（第二环 破局七天会员）在：${companionPath('poster-poju.jpg')}`,
        `- 易洋那张视角卡（第四环立视角卡选了易洋时照它写）在：${companionPath('lens-yiyang.md')}`,
        '- 书里写的 .dsh/books/ai-global-media/ 下的这四样，工作区里没有就用上面这四个位置的。',
      ];
      const text = part(book, which);
      return { content: [{ type: 'text', text: text === null ? toc(book, extra) : render(text, String(which)) }] };
    },
  };
}

/* ---------- the gated second half ---------- */

/** Fetch the book once; the caller owns retries. */
export async function fetchBook(options, fetchImpl = globalThis.fetch, signal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });
  try {
    let res;
    try {
      res = await fetchImpl(options.bookUrl, {
        method: 'GET',
        headers: { 'X-Pass': options.pass, 'Accept': 'text/markdown, text/plain;q=0.9, */*;q=0.1', 'User-Agent': 'dsh-plugin-chuhai/' + VERSION },
        redirect: 'follow',
        signal: controller.signal,
      });
    } catch (err) {
      const cause = err?.cause?.code ?? err?.code ?? (err?.name === 'AbortError' ? 'TIMEOUT' : err?.message ?? String(err));
      throw new Error('chuhai: 连不上 dsh.chuhai.express（' + cause + '）。先看这台电脑能不能打开网页，稍后再试一次；一直连不上就到 dsh.ilang.guide 看公告。');
    }
    if (res.status === 401) throw new Error('chuhai: 取书被拒（401）。插件带的密码和站上的不一致，请把插件更新到最新版本；更新后还不行就到 dsh.ilang.guide 看公告。');
    if (!res.ok) throw new Error('chuhai: 取书失败，HTTP ' + res.status + '。稍后再试一次；一直失败就到 dsh.ilang.guide 看公告。');
    const text = await res.text();
    if (!text.includes('::ILANG::')) throw new Error('chuhai: 取回的不是工程书（没有 ::ILANG:: 标记）。稍后再试一次。');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

export function toolDefinition(options, fetchImpl) {
  let cached = null; // { at, text }
  async function text(signal) {
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.text;
    const t = await fetchBook(options, fetchImpl, signal);
    cached = { at: Date.now(), text: t };
    return t;
  }
  return {
    name: 'chuhai_book',
    description: '取「自媒体出海」后半段的工程书（出海：海外服务器、设备、X 账号、Premium）。书放在 dsh.chuhai.express，插件带密码取。先 part=toc 看目录，再按段取：head、各模块、tail。只在 zimeiti-chuhai 技能让你取的时候调用。',
    parameters: {
      type: 'object',
      properties: { part: { type: 'string', description: 'toc（目录，默认）、head、tail，或模块名（如 M1_DEPLOY_SERVER）；多页时写 段名#页号' } },
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', properties: { content: { type: 'array', items: {} } }, required: ['content'], additionalProperties: false },
      render(_args, value) { return value.content; },
    },
    async execute(args, exec) {
      const book = splitBook(await text(exec?.signal));
      const which = args?.part;
      const t = part(book, which);
      return { content: [{ type: 'text', text: t === null ? toc(book) : render(t, String(which)) }] };
    },
  };
}

/* ---------- skill + plugin ---------- */

export function skillDefinition() {
  return {
    name: SKILL_NAME,
    description: '自媒体出海：用户说「自媒体出海」或「AI全球自媒体」、想做海外自媒体、想上 X 开蓝 V 时加载。从零一环一环带，先国内公众号走通，再走到海外平台。书随插件带着，不用先装别的。',
    whenToUse: '用户提到自媒体出海、AI全球自媒体、出海、海外平台、X、推特、蓝 V、Premium，或问「接下来怎么做」时。',
    source: 'runtime',
    content: skillContent(),
    metadata: { plugin: 'dsh-plugin-chuhai', version: VERSION },
  };
}

export function apply(ctx, config = {}) {
  const options = normalize(config);
  ctx.effect(() => {
    const disposers = [];
    try {
      disposers.push(ctx.skills.register(skillDefinition()));
      disposers.push(ctx.tools.register(mainBookDefinition()));
      disposers.push(ctx.tools.register(toolDefinition(options)));
      ctx.logger?.info?.('chuhai: skill ' + SKILL_NAME + ', tools chuhai_main_book and chuhai_book registered');
    } catch (err) {
      for (const d of disposers) { try { d(); } catch { /* ignore */ } }
      throw err;
    }
    return () => { for (const d of disposers) { try { d(); } catch { /* ignore */ } } };
  });
}
