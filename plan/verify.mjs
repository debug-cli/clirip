import fs from 'node:fs';

let fail = 0;
const ok = (c, m) => {
  console.log((c ? 'PASS  ' : 'FAIL  ') + m);
  if (!c) fail++;
};

// 1. exact file set (prompt section 14 + the user-requested PROMPT-MISSION.md)
const root = fs.readdirSync('.').filter(f => fs.statSync(f).isFile());
const planDir = fs.readdirSync('plan').sort();
['AGENTS.md', 'PROMPT-MISSION.md', 'cli-rip_enhanced-prompt-v1.md'].forEach(f =>
  ok(root.includes(f), 'root holds ' + f));
ok(JSON.stringify(planDir) === JSON.stringify(['DESIGN.md', 'PLAN.md', 'SPEC.md', 'ledger.md', 'verify.mjs']),
  'plan/ holds exactly the four artifacts (+verify.mjs)');

// 2. full tools note verbatim in both AGENTS.md and PLAN.md
const note = [
  '- Fetch, web search, and stealthy fetch are available through Scrapling.',
  '- Use fetch for official docs and plain pages. Use web search to confirm current package versions and API names. Use stealthy fetch only to read public documentation when plain fetch is blocked. Never use it to get past logins or paywalls. Respect robots.txt and site terms.',
  '- GitHub tree pages block automated access. Use git clone --depth 1 or raw.githubusercontent.com.',
  '- Record the source URL of every external fact you rely on in plan/ledger.md.',
  '- Load the design-taste-frontend skill before any task touching docs/index.html.'
].join('\n');
const agents = fs.readFileSync('AGENTS.md', 'utf8');
const plan = fs.readFileSync('plan/PLAN.md', 'utf8');
ok(agents.includes(note), 'tools note verbatim in AGENTS.md');
ok(plan.includes(note), 'tools note verbatim in PLAN.md');

// 3. contract parity with prompt section 6
const declarations = [
  'export type EngineId',
  'export interface FormatOption',
  'export interface ProbeResult',
  'export interface Progress',
  'export interface DownloadResult',
  'export interface Engine {',
  'export class EngineError extends Error'
];
declarations.forEach(d => ok(agents.includes(d), 'contract declaration: ' + d));
[
  'userMessage', 'approxBytes', 'bytesPerSec', 'etaSec',
  'available(): Promise<{ ok: true } | { ok: false; reason: string }>',
  'signal: AbortSignal', 'onProgress: (p: Progress) => void',
  'public engine: EngineId'
].forEach(f => ok(agents.includes(f), 'contract member: ' + f));
ok(agents.includes("'yt-dlp' | 'cobalt' | 'gallery-dl' | 'newpipe'"), 'EngineId union exact');

// 4. every task block carries all nine required fields
const blocks = plan.split(/\n### /).slice(1);
ok(blocks.length === 47, `47 task blocks (got ${blocks.length})`);
const fields = ['Goal:', 'Depends on:', 'Files:', 'Interfaces:', 'Failing test first:', 'Steps:', 'Verify:', 'Done when:', 'Do not:'];
const incomplete = [];
for (const b of blocks) {
  const id = b.split(' ')[0];
  for (const f of fields) if (!b.includes(f)) incomplete.push(`${id}->${f}`);
}
ok(incomplete.length === 0, 'all 9 required fields in every block' +
  (incomplete.length ? ' missing: ' + incomplete.join(', ') : ''));

// 5. D tasks carry at most 4 content sections
const over = blocks
  .filter(b => /^D\d+/.test(b))
  .map(b => [b.split(' ')[0], (b.match(/Sections: `[^`]+`/g) || [])
    .join('').split('`,`').filter(Boolean).length])
  .filter(([, n]) => n > 4);
ok(over.length === 0, 'D tasks carry <=4 content sections each' +
  (over.length ? ' over: ' + JSON.stringify(over) : ''));

// 6. every task carries a priority label
const noprio = blocks.filter(b => !/\[P0\]|\[P1\]|\[P2\]/.test(b)).map(b => b.split(' ')[0]);
ok(noprio.length === 0, 'every task carries a priority' + (noprio.length ? ': ' + noprio.join(',') : ''));

// 7. PROMPT-MISSION structure
const mis = fs.readFileSync('PROMPT-MISSION.md', 'utf8');
['**Mission:**', '**Read in this order', '**Then, per task:**', '**Never:**',
  '**Stop and ask only for:**', '**Finish line:**'].forEach(s =>
  ok(mis.includes(s), 'mission has ' + s.replaceAll('*', '')));
ok(mis.split('\n').length < 60, `mission is tiny (${mis.split('\n').length} lines)`);

// 8. zero em/en dashes and zero emoji in every deliverable
const files = ['AGENTS.md', 'PROMPT-MISSION.md', 'plan/SPEC.md', 'plan/DESIGN.md', 'plan/PLAN.md', 'plan/ledger.md'];
const dirty = files.filter(f => {
  const t = fs.readFileSync(f, 'utf8');
  return [...t].some(c => c === '—' || c === '–' ||
    ((c.codePointAt(0) >= 0x1f300 && c.codePointAt(0) <= 0x1faff) ||
     (c.codePointAt(0) >= 0x2600 && c.codePointAt(0) <= 0x27bf)));
});
ok(dirty.length === 0, 'zero em/en dashes and zero emoji in all 6 files' +
  (dirty.length ? ' dirty: ' + dirty.join(',') : ''));

console.log(fail ? `\n${fail} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(fail ? 1 : 0);
