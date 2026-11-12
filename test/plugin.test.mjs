import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apply, normalize, skillDefinition, toolDefinition, fetchBook, name, inject } from '../lib/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));

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

test('skill definition is model-loadable', () => {
  const s = skillDefinition();
  assert.match(s.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(s.description.includes('自媒体出海'));
  assert.ok(s.content.includes('chuhai_book'));
  assert.ok(s.content.length > 400 && s.content.length < 6000, 'body size ' + s.content.length);
  assert.equal(s.source, 'runtime');
});

test('skill body equals the shipped markdown file', () => {
  const file = fs.readFileSync(path.join(here, '..', 'skills', 'zimeiti-chuhai.md'), 'utf8');
  assert.equal(skillDefinition().content, file);
});

test('normalize: defaults and https only', () => {
  const o = normalize({});
  assert.equal(o.bookUrl, 'https://dsh.chuhai.express/book');
  assert.equal(o.pass, '');
  assert.equal(o.timeoutMs, 30000);
  assert.throws(() => normalize({ bookUrl: 'http://x/' }), /https/);
});

test('apply registers one skill and one tool, dispose removes both', () => {
  const { ctx, skills, tools, disposed } = fakeCtx();
  apply(ctx, { pass: 'p' });
  assert.equal(skills.length, 1);
  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, 'chuhai_book');
  ctx._dispose();
  assert.equal(disposed(), 2);
});

test('tool sends the pass header and returns the book text', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, headers: init.headers });
    return { ok: true, status: 200, text: async () => '::ILANG::v5.0::ENGINEERING_BOOK\nbody\n::ILANG::v5.0::ENGINEERING_BOOK\n' };
  };
  const tool = toolDefinition(normalize({ pass: 'secret-1' }), fetchImpl);
  const out = await tool.execute({}, {});
  assert.equal(calls[0].url, 'https://dsh.chuhai.express/book');
  assert.equal(calls[0].headers['X-Pass'], 'secret-1');
  assert.ok(out.content[0].text.startsWith('::ILANG::'));
  assert.equal(tool.output.render({}, out)[0].text, out.content[0].text);
});

test('401 and non-book bodies become plain errors', async () => {
  const o = normalize({ pass: 'x' });
  await assert.rejects(fetchBook(o, async () => ({ ok: false, status: 401, text: async () => '' })), /401/);
  await assert.rejects(fetchBook(o, async () => ({ ok: false, status: 503, text: async () => '' })), /503/);
  await assert.rejects(fetchBook(o, async () => ({ ok: true, status: 200, text: async () => '<html>gate</html>' })), /ILANG/);
});

test('network failures become one plain sentence with the cause', async () => {
  const o = normalize({ pass: 'x' });
  const err = new TypeError('fetch failed');
  err.cause = Object.assign(new Error('getaddrinfo ENOTFOUND dsh.chuhai.express'), { code: 'ENOTFOUND' });
  await assert.rejects(fetchBook(o, async () => { throw err; }), /连不上 dsh\.chuhai\.express（ENOTFOUND）/);
});
