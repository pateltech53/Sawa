// WCAG 2.1 AA check (axe-core) across every role's main screens, in English and Arabic.
// Run with the app started: node scripts/a11y.cjs
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const B = process.env.BASE_URL || 'http://localhost:3000';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  await p.goto(B);
  const as = (r, l) => p.evaluate(([r, l]) => { const k = 'sawa-demo-v2'; const s = JSON.parse(localStorage.getItem(k) || '{}'); s.sessionUserId = { parent: 'par-khalid', teacher: 'tch-aisha', student: 'stu-sara' }[r]; s.onboarded = { ...(s.onboarded || {}), [s.sessionUserId]: true }; s.lang = l; localStorage.setItem(k, JSON.stringify(s)); }, [r, l]);
  const pages = { student: ['today', 'explore', 'communities', 'profile', 'ask'], parent: ['today', 'approvals', 'services'], teacher: ['today', 'students', 'career'] };
  const all = {};
  for (const l of ['en', 'ar']) for (const [r, list] of Object.entries(pages)) {
    await as(r, l);
    for (const pg of list) {
      await p.goto(`${B}/app/${pg}`); await p.waitForTimeout(1200);
      const res = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).disableRules(['region']).analyze();
      for (const v of res.violations) {
        const key = `${v.id} (${v.impact})`;
        all[key] = all[key] || { help: v.help, where: new Set(), n: 0 };
        all[key].n += v.nodes.length; all[key].where.add(`${l}/${r}/${pg}`);
        if (all[key].sample === undefined) all[key].sample = v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1]);
      }
    }
  }
  for (const [k, v] of Object.entries(all)) console.log(`${k} x${v.n} — ${v.help}\n   pages: ${[...v.where].slice(0, 6).join(', ')}\n   e.g. ${v.sample.join('\n        ')}`);
  console.log('violation types:', Object.keys(all).length);
  await b.close();
})();
