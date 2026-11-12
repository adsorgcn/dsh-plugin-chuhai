import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  apply, normalize, skillDefinition, toolDefinition, mainBookDefinition, fetchBook, splitBook, toc, part,
  mainBookText, mainBookPath, posterPath, name, inject,
} from '../lib/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const LIMIT = 8192;

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

test('splitBook: head / modules / tail, nothing lost, every part under the trim line', () => {
  for (const text of [FIXTURE, mainBookText()]) {
    const b = splitBook(text);
    assert.ok(b.modules.length >= 2, 'modules ' + b.modules.length);
    assert.ok(b.head.includes('::') && b.tail.includes('::RUBRIC'));
    const rebuilt = [b.head, ...b.modules.map((m) => m.text), b.tail].join('\n');
    const norm = (s) => s.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).filter(Boolean).join('\n');
    assert.equal(norm(rebuilt), norm(text), 'parts do not add up to the book');
    for (const [label, s] of [['head', b.head], ['tail', b.tail], ...b.modules.map((m) => [m.id, m.text])]) {
      assert.ok(s.length < LIMIT, `${label} is ${s.length} chars`);
    }
  }
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
  const tool = mainBookDefinition();
  const t = (await tool.execute({}, {})).content[0].text;
  assert.ok(t.includes('PERSONA') && t.includes('poster.jpg'));
  const head = (await tool.execute({ part: 'head' }, {})).content[0].text;
  assert.ok(head.startsWith('::ILANG::v5.0::ENGINEERING_BOOK') && head.length < LIMIT);
  const ring = (await tool.execute({ part: 'LIBRARY' }, {})).content[0].text;
  assert.ok(ring.startsWith('::MODULE{LIBRARY'));
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
