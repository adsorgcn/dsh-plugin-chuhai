import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  apply, normalize, skillDefinition, toolDefinition, mainBookDefinition, fetchBook, splitBook, toc, part, pages,
  mainBookText, mainBookPath, posterPath, companionPath, name, inject,
  fetchLatestMainBook, sha256Lf, compareVersions,
} from '../lib/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const LIMIT = 8192;
const PART_LIMIT = 8000;

const FIXTURE = [
  '::ILANG::v5.0::ENGINEERING_BOOK', '[TYPE:engineering_book]', '[ID:FIXTURE-BOOK]', '[VERSION:9.9]', '',
  '::STATE{user}', '  role: 学员', '', '::RULE{a then b|source:@SUN}', '',
  '::MODULE{M0_FIRST|title:第一步}', '  [STEP] one', '', '::MODULE{M1_SECOND}', '  [STEP] two', '',
  '::RUBRIC{scoring}', '  T:S1 ok', '', '::ILANG::v5.0::ENGINEERING_BOOK', '',
].join('\n');

function fakeCtx() {
  const skills = [], tools = [];
  let disposed = 0;
  const ctx = {
    skills: { register(s) { skills.push(s); return () => { disposed += 1; }; } },
    tools: { register(t) { tools.push(t); return () => { disposed += 1; }; } },
    logger: { info() {}, warn() {} },
    effect(fn) { ctx._dispose = fn(); },
  };
  return { ctx, skills, tools, disposed: () => disposed };
}

test('module shape', () => {
  assert.equal(name, 'chuhai');
  assert.deepEqual(inject, ['skills', 'tools']);
});

test('skill definition is model-loadable and names both tools', () => {
  const s = skillDefinition();
  assert.match(s.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(s.description.includes('自媒体出海'));
  assert.ok(s.content.includes('chuhai_main_book') && s.content.includes('chuhai_book'));
  assert.ok(s.content.length > 400 && s.content.length < LIMIT, 'body size ' + s.content.length);
  assert.equal(s.content, fs.readFileSync(path.join(here, '..', 'skills', 'zimeiti-chuhai.md'), 'utf8'));
});

test('the shipped first half is a whole book with its poster', () => {
  const t = mainBookText();
  assert.ok(t.startsWith('::ILANG::v5.0::ENGINEERING_BOOK'));
  assert.ok(t.trimEnd().endsWith('::ILANG::v5.0::ENGINEERING_BOOK'));
  assert.ok(fs.existsSync(posterPath()), 'poster.jpg missing');
  assert.ok(fs.statSync(mainBookPath()).size > 10000);
});

test('the files the book points at ship next to it: second poster and the second lens card', () => {
  const t = mainBookText();
  for (const f of ['poster-poju.jpg', 'lens-yiyang.md']) {
    assert.ok(t.includes(f), `book does not mention ${f}`);
    assert.ok(fs.existsSync(companionPath(f)), `${f} missing`);
  }
  const lens = fs.readFileSync(companionPath('lens-yiyang.md'), 'utf8');
  assert.ok(lens.startsWith('::ILANG::v5.0') && lens.trimEnd().endsWith('::ILANG::v5.0'));
  assert.ok(lens.includes('|q:'), 'lens card rules must carry their quotes');
});

test('the expert package ships next to the book, byte for byte against its source manifest', async () => {
  const { createHash } = await import('node:crypto');
  const root = companionPath('expert');
  const man = JSON.parse(fs.readFileSync(path.join(root, 'SOURCE.json'), 'utf8'));
  assert.match(man.upstream.commit, /^[0-9a-f]{40}$/);
  const names = Object.keys(man.files);
  assert.ok(names.includes('agents/ilang-wechat-awesome.md'));
  for (const s of ['wechat-article', 'wechat-draft-push', 'wechat-topic-hunter', 'remote-dispatch']) {
    assert.ok(names.includes(`skills/${s}/SKILL.md`), `${s} missing from the manifest`);
  }
  for (const rel of names) {
    const buf = fs.readFileSync(path.join(root, rel));
    const lf = Buffer.from(buf.toString('latin1').split('\r\n').join('\n'), 'latin1');
    assert.equal(createHash('sha256').update(lf).digest('hex'), man.files[rel], `${rel} differs from its source`);
  }
  assert.ok(mainBookText().includes('.dsh/books/ai-global-media/expert'), 'book must point at the bundled expert package');
});

test('splitBook: head / modules / tail, nothing lost, every page of every part under PART_LIMIT and joins back', () => {
  for (const text of [FIXTURE, mainBookText()]) {
    const b = splitBook(text);
    assert.ok(b.modules.length >= 2, 'modules ' + b.modules.length);
    assert.ok(b.head.includes('::') && b.tail.includes('::RUBRIC'));
    const rebuilt = [b.head, ...b.modules.map((m) => m.text), b.tail].join('\n');
    const norm = (s) => s.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).filter(Boolean).join('\n');
    assert.equal(norm(rebuilt), norm(text), 'parts do not add up to the book');
    for (const [label, s] of [['head', b.head], ['tail', b.tail], ...b.modules.map((m) => [m.id, m.text])]) {
      const ps = pages(s);
      for (const p of ps) {
        assert.ok(p.length <= PART_LIMIT, `${label} page is ${p.length} chars`);
      }
      assert.equal(ps.join('\n'), s, `${label} pages do not join back`);
    }
  }
});

test('pages: a 20000-char module pages at block boundaries, toc labels pages, M#2 works, M#9 errors', () => {
  const steps = [];
  let n = 0;
  while (steps.join('\n').length < 20000) {
    n += 1;
    steps.push(`  [STEP] ${n} ${'x'.repeat(190)}`);
    steps.push('');
  }
  const text = '::ILANG::v5.0::ENGINEERING_BOOK\n[TYPE:engineering_book]\n[ID:PAGES-BOOK]\n[VERSION:1.0]\n\n'
    + '::STATE{user}\n  role: 学员\n\n'
    + '::MODULE{M|title:很长的一段}\n' + steps.join('\n') + '\n'
    + '::RUBRIC{scoring}\n  T:S1 ok\n\n::ILANG::v5.0::ENGINEERING_BOOK\n';
  const b = splitBook(text);
  const M = b.modules.find((x) => x.id === 'M');
  assert.ok(M.text.length > PART_LIMIT, 'module should exceed the limit, got ' + M.text.length);
  const ps = pages(M.text);
  assert.ok(ps.length >= 2, 'pages ' + ps.length);
  assert.equal(ps.join('\n'), M.text, 'pages do not join back');
  const t = toc(b);
  assert.ok(t.includes(`${ps.length} 页 M#1 到 M#${ps.length}`), 'toc lacks page labels: ' + t);
  const p1 = part(b, 'M#1');
  const p2 = part(b, 'M#2');
  assert.ok(p1.length <= PART_LIMIT && p2.length <= PART_LIMIT, `pages over limit: ${p1.length}/${p2.length}`);
  const first = part(b, 'M');
  assert.ok(first.includes('这段共') && first.includes('接着取 M#2'), 'first page lacks the hint: ' + first.slice(0, 120));
  assert.throws(() => part(b, 'M#9'), /没有第 9 页/);
});

test('main book: the six rings are addressable and the toc lists them', () => {
  const b = splitBook(mainBookText());
  assert.deepEqual(b.modules.map((m) => m.id), ['PERSONA', 'SOURCE', 'LIBRARY', 'ARTICLE', 'PUBLISH', 'REPORT']);
  const t = toc(b, ['- extra line']);
  for (const id of ['head', 'PERSONA', 'REPORT', 'tail', 'extra line']) assert.ok(t.includes(id), 'toc lacks ' + id);
  assert.equal(part(b, 'toc'), null);
  assert.ok(part(b, 'persona').startsWith('::MODULE{PERSONA'));
  assert.throws(() => part(b, 'NOPE'), /没有叫/);
});

test('normalize: defaults and https only', () => {
  const o = normalize({});
  assert.equal(o.bookUrl, 'https://dsh.chuhai.express/book');
  assert.equal(o.pass, '');
  assert.throws(() => normalize({ bookUrl: 'http://x/' }), /https/);
});

test('apply registers one skill and two tools, dispose removes all three', () => {
  const { ctx, skills, tools, disposed } = fakeCtx();
  apply(ctx, { pass: 'p' });
  assert.equal(skills.length, 1);
  assert.deepEqual(tools.map((t) => t.name), ['chuhai_main_book', 'chuhai_book']);
  ctx._dispose();
  assert.equal(disposed(), 3);
});

test('chuhai_main_book: toc by default, parts on request, poster path in the toc', async () => {
  const tool = mainBookDefinition(normalize({ liveMainBook: false }), async () => { throw new Error('the switch is off, nothing may be fetched'); });
  const t = (await tool.execute({}, {})).content[0].text;
  assert.ok(t.includes('PERSONA') && t.includes('poster.jpg'));
  assert.ok(t.includes('插件里带的'), 'toc must say which copy is in use');
  assert.ok(t.includes('poster-poju.jpg') && t.includes('lens-yiyang.md'), 'toc must say where the new companion files are');
  assert.ok(t.includes('写作专家包') && t.includes(companionPath('expert')), 'toc must say where the expert package is');
  const head = (await tool.execute({ part: 'head' }, {})).content[0].text;
  assert.ok(head.startsWith('::ILANG::v5.0::ENGINEERING_BOOK') && head.length < LIMIT);
  const ring = (await tool.execute({ part: 'LIBRARY' }, {})).content[0].text;
  assert.ok(ring.startsWith('::MODULE{LIBRARY'));
});

/* ---------- the latest main book, taken live and checked ---------- */

const SOURCES = [
  { name: 'A', registry: 'https://a.example/registry.json', book: 'https://a.example/BOOK.md' },
  { name: 'B', registry: 'https://b.example/registry.json', book: 'https://b.example/BOOK.md' },
];

/** A copy of the shipped book with another version line: a valid, different edition. */
function edition(version, extra = '') {
  return mainBookText().replace(/\r\n/g, '\n').replace(/^\[VERSION:[^\]]*\]/m, `[VERSION:${version}]`).replace('::MODULE{PERSONA', extra + '::MODULE{PERSONA');
}

function registryFor(text, over = {}) {
  const version = /^\[VERSION:([^\]]+)\]/m.exec(text)[1];
  return JSON.stringify({ entries: [{ kind: 'plugin', name: 'x' }, { kind: 'book', name: 'ai-global-media', version, sha256_lf: sha256Lf(text), ...over }] });
}

/** A fetch stand-in: `site` maps a URL to a body, an Error to throw, or a number to answer with that status. */
function fakeFetch(site, calls = []) {
  return async (url) => {
    calls.push(url);
    const v = site[url];
    if (v instanceof Error) throw v;
    if (typeof v === 'number') return { ok: false, status: v, text: async () => '' };
    if (v === undefined) return { ok: false, status: 404, text: async () => '' };
    return { ok: true, status: 200, text: async () => v };
  };
}

function shippedVersion() {
  return /^\[VERSION:([^\]]+)\]/m.exec(mainBookText())[1];
}

function bump(v, by) {
  const p = v.split('.').map(Number);
  p[p.length - 1] += by;
  return p.join('.');
}

test('compareVersions orders dotted numbers', () => {
  assert.equal(compareVersions('0.2.10', '0.2.9'), 1);
  assert.equal(compareVersions('0.2.7', '0.2.7'), 0);
  assert.equal(compareVersions('0.2', '0.2.1'), -1);
});

test('live main book: a newer edition whose digest matches the registry is served, and fetched once', async () => {
  const newer = edition(bump(shippedVersion(), 1), '::RULE{live_marker then 这一行只在新版里|source:test}\n\n');
  const calls = [];
  const site = { [SOURCES[0].registry]: registryFor(newer), [SOURCES[0].book]: newer, [SOURCES[1].registry]: new Error('offline'), [SOURCES[1].book]: new Error('offline') };
  const tool = mainBookDefinition(normalize({ mainBookSources: SOURCES }), fakeFetch(site, calls));
  const t = (await tool.execute({}, {})).content[0].text;
  assert.ok(t.includes(`版本 ${bump(shippedVersion(), 1)}`), 'toc should show the live version: ' + t.split('\n')[0]);
  assert.ok(t.includes('从 A 取的最新版') && t.includes('摘要核对过'), 'toc should say where the book came from');
  assert.ok(t.includes(companionPath('expert')), 'companion files still come from the package');
  let head = (await tool.execute({ part: 'head' }, {})).content[0].text;
  if (head.includes('接着取 head#2')) head += (await tool.execute({ part: 'head#2' }, {})).content[0].text; // the extra line tips the head onto a second page
  assert.ok(head.includes('live_marker'), 'parts must come from the live edition');
  const n = calls.length;
  await tool.execute({ part: 'tail' }, {});
  assert.equal(calls.length, n, 'later parts come from the cache');
});

test('live main book: a source whose book does not match its registry is refused, the other source is used', async () => {
  const good = edition(bump(shippedVersion(), 2));
  const tampered = good.replace('::MODULE{PERSONA', '::RULE{x then 被改过|source:nobody}\n\n::MODULE{PERSONA');
  const site = { [SOURCES[0].registry]: registryFor(good), [SOURCES[0].book]: tampered, [SOURCES[1].registry]: registryFor(good), [SOURCES[1].book]: good };
  const live = await fetchLatestMainBook(normalize({ mainBookSources: SOURCES }), fakeFetch(site));
  assert.equal(live.source, 'B');
  assert.equal(live.text, good);
});

test('live main book: wrong version line, half a book, a missing row: each is refused', async () => {
  const good = edition(bump(shippedVersion(), 1));
  const o = normalize({ mainBookSources: [SOURCES[0]] });
  const cases = [
    [{ [SOURCES[0].registry]: registryFor(good, { version: '9.9.9' }), [SOURCES[0].book]: good }, /版本对不上/],
    [{ [SOURCES[0].registry]: registryFor(good), [SOURCES[0].book]: good.slice(0, 3000) }, /不是完整的工程书/],
    [{ [SOURCES[0].registry]: JSON.stringify({ entries: [] }), [SOURCES[0].book]: good }, /清单里没有这本书/],
    [{ [SOURCES[0].registry]: '<html>', [SOURCES[0].book]: good }, /清单没取到/],
    [{ [SOURCES[0].registry]: registryFor(good), [SOURCES[0].book]: 503 }, /书没取到（HTTP 503）/],
  ];
  for (const [site, pattern] of cases) await assert.rejects(fetchLatestMainBook(o, fakeFetch(site)), pattern);
});

test('live main book: nothing reachable, or an older edition online: the shipped copy is used and the toc says so', async () => {
  const down = { [SOURCES[0].registry]: new Error('ENOTFOUND'), [SOURCES[1].registry]: 500 };
  const t1 = (await mainBookDefinition(normalize({ mainBookSources: SOURCES }), fakeFetch(down)).execute({}, {})).content[0].text;
  assert.ok(t1.includes(`版本 ${shippedVersion()}`) && t1.includes('这次没取到') && t1.includes('不影响照着做'), t1.split('\n').slice(0, 12).join(' | '));
  const older = edition('0.0.1');
  const old = { [SOURCES[0].registry]: registryFor(older), [SOURCES[0].book]: older, [SOURCES[1].registry]: 500 };
  const t2 = (await mainBookDefinition(normalize({ mainBookSources: SOURCES }), fakeFetch(old)).execute({}, {})).content[0].text;
  assert.ok(t2.includes(`版本 ${shippedVersion()}`) && t2.includes('比它旧'), 'an older online edition must not replace the shipped one');
});

test('live main book: sources must be https; the default sources are the toolkit repository and its mirror', () => {
  assert.throws(() => normalize({ mainBookSources: [{ name: 'x', registry: 'http://x/r.json', book: 'https://x/b.md' }] }), /https/);
  const o = normalize({});
  assert.equal(o.liveMainBook, true);
  assert.deepEqual(o.mainBookSources.map((s) => s.name), ['GitHub', 'Gitee']);
  for (const s of o.mainBookSources) {
    assert.ok(s.registry.endsWith('/docs/market/registry.json') && s.book.endsWith('/.dsh/books/ai-global-media/BOOK.md'));
  }
});

test('chuhai_book: sends the pass header once, serves parts from one fetch', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, headers: init.headers }); return { ok: true, status: 200, text: async () => FIXTURE }; };
  const tool = toolDefinition(normalize({ pass: 'secret-1' }), fetchImpl);
  const t = (await tool.execute({}, {})).content[0].text;
  assert.ok(t.includes('M0_FIRST') && t.includes('第一步'));
  const m1 = (await tool.execute({ part: 'M1_SECOND' }, {})).content[0].text;
  assert.ok(m1.startsWith('::MODULE{M1_SECOND'));
  assert.equal(calls.length, 1, 'second part should come from the cache');
  assert.equal(calls[0].url, 'https://dsh.chuhai.express/book');
  assert.equal(calls[0].headers['X-Pass'], 'secret-1');
  assert.equal(tool.output.render({}, { content: [{ type: 'text', text: 'x' }] })[0].text, 'x');
});

test('401, non-book bodies and network failures become plain sentences', async () => {
  const o = normalize({ pass: 'x' });
  await assert.rejects(fetchBook(o, async () => ({ ok: false, status: 401, text: async () => '' })), /401/);
  await assert.rejects(fetchBook(o, async () => ({ ok: false, status: 503, text: async () => '' })), /503/);
  await assert.rejects(fetchBook(o, async () => ({ ok: true, status: 200, text: async () => '<html>gate</html>' })), /ILANG/);
  const err = new TypeError('fetch failed');
  err.cause = Object.assign(new Error('getaddrinfo ENOTFOUND dsh.chuhai.express'), { code: 'ENOTFOUND' });
  await assert.rejects(fetchBook(o, async () => { throw err; }), /连不上 dsh\.chuhai\.express（ENOTFOUND）/);
});
