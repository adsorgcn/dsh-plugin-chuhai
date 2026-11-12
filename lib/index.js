/**
 * dsh-plugin-chuhai — 自媒体出海 for DeepSeek Harness.
 *
 * Registers one skill, `zimeiti-chuhai`, that the model loads when the user says
 * 自媒体出海 / AI全球自媒体, and one tool, `chuhai_book`, that fetches the
 * second half of the journey (going global) from dsh.chuhai.express with the
 * access key the plugin carries. Nothing else: no keys of the user's, no
 * network traffic unless the tool is called.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'chuhai';
export const inject = ['skills', 'tools'];

const SKILL_NAME = 'zimeiti-chuhai';
const DEFAULT_BOOK_URL = 'https://dsh.chuhai.express/book';
const VERSION = readVersion();

function here() {
  return path.dirname(fileURLToPath(import.meta.url));
}

function readVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(here(), '..', 'package.json'), 'utf8')).version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/** The skill body ships as a Markdown file so it can be read and edited as text. */
export function skillContent() {
  return fs.readFileSync(path.join(here(), '..', 'skills', SKILL_NAME + '.md'), 'utf8');
}

export function normalize(config = {}) {
  const bookUrl = typeof config.bookUrl === 'string' && config.bookUrl ? config.bookUrl : DEFAULT_BOOK_URL;
  if (!/^https:\/\//.test(bookUrl)) throw new Error('chuhai: bookUrl must be https');
  const pass = typeof config.pass === 'string' ? config.pass : '';
  const timeoutMs = Number(config.timeoutMs ?? 30_000);
  return { bookUrl, pass, timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30_000 };
}

export function skillDefinition() {
  return {
    name: SKILL_NAME,
    description: '自媒体出海：用户说「自媒体出海」或「AI全球自媒体」、想做海外自媒体、想上 X 开蓝 V 时加载。从装好工具包开始一环一环带，走到海外平台。',
    whenToUse: '用户提到自媒体出海、AI全球自媒体、出海、海外平台、X、推特、蓝 V、Premium，或问「接下来怎么做」时。',
    source: 'runtime',
    content: skillContent(),
    metadata: { plugin: 'dsh-plugin-chuhai', version: VERSION },
  };
}

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
  return {
    name: 'chuhai_book',
    description: '取「自媒体出海」后半段的工程书（出海：买海外服务器、装加速、客户端、注册 X、开 Premium）。只在 zimeiti-chuhai 技能让你取的时候调用；取回来照书从 M0 开始做。',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    output: {
      schema: { type: 'object', properties: { content: { type: 'array', items: {} } }, required: ['content'], additionalProperties: false },
      render(_args, value) { return value.content; },
    },
    async execute(_args, exec) {
      const text = await fetchBook(options, fetchImpl, exec?.signal);
      return { content: [{ type: 'text', text }] };
    },
  };
}

export function apply(ctx, config = {}) {
  const options = normalize(config);
  ctx.effect(() => {
    const disposers = [];
    try {
      disposers.push(ctx.skills.register(skillDefinition()));
      disposers.push(ctx.tools.register(toolDefinition(options)));
      ctx.logger?.info?.('chuhai: skill ' + SKILL_NAME + ' and tool chuhai_book registered');
    } catch (err) {
      for (const d of disposers) { try { d(); } catch { /* ignore */ } }
      throw err;
    }
    return () => { for (const d of disposers) { try { d(); } catch { /* ignore */ } } };
  });
}
