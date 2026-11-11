// Ask Sawa does tasks in chat; profile photo from the (fake) camera; student customisation.
const { chromium } = require('playwright');
const OUT = require('path').join(__dirname, '..', 'e2e-screens', 'agent'); require('fs').mkdirSync(OUT, { recursive: true });
const B = process.env.BASE_URL || 'http://localhost:3000';
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, permissions: ['camera'] });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  const as = (r) => p.evaluate((r) => { const k = 'sawa-demo-v2'; const s = JSON.parse(localStorage.getItem(k) || '{}'); s.sessionUserId = { parent: 'par-khalid', teacher: 'tch-aisha', student: 'stu-sara' }[r]; s.onboarded = { ...(s.onboarded || {}), [s.sessionUserId]: true }; s.lang = 'en'; localStorage.setItem(k, JSON.stringify(s)); }, r);
  await p.goto(B); await as('parent');
  await p.goto(B + '/app/ask'); await p.waitForTimeout(1000);
  await p.click('button:has-text("Pay Sara\'s next fee instalment")'); await p.waitForSelector('text=Sawa · task'); await p.screenshot({ path: OUT + '/1-task-plan.png' });
  await p.click('button:has-text("Pay AED 150")'); await p.waitForSelector('text=Paid instalment 1', { timeout: 5000 }); await p.screenshot({ path: OUT + '/2-task-done.png' });
  await p.fill('input[aria-label="Your question"]', 'Re-enrol Sara for next year'); await p.keyboard.press('Enter'); await p.waitForSelector('text=Update the ID'); await p.screenshot({ path: OUT + '/3-task-blocked.png' });
  await as('student'); await p.goto(B + '/app/profile'); await p.waitForTimeout(800);
  await p.click('button[aria-label="Change profile photo"]'); await p.waitForSelector('button:has-text("Take photo"):not([disabled])', { timeout: 8000 }); await p.waitForTimeout(600); await p.screenshot({ path: OUT + '/4-camera.png' });
  await p.click('button:has-text("Take photo")'); await p.click('button:has-text("Use this photo")'); await p.waitForTimeout(600); await p.screenshot({ path: OUT + '/5-photo-set.png' });
  await p.click('button[aria-label="Customise Sawa"]'); await p.click('button[aria-label="Orchid"]'); await p.click('button[role="switch"]:has-text("Google Classroom")'); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '/6-customise.png' });
  await p.click('button:has-text("Done")'); await p.click('button:has-text("New project")'); await p.fill('input[placeholder*="bird feeder"]', 'Solar bird feeder'); await p.click('button:has-text("Create project")'); await p.waitForTimeout(500);
  await p.click('button:has-text("Line-follower robot")'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/7-project.png' });
  const photo = await p.evaluate(() => Boolean(JSON.parse(localStorage.getItem('sawa-demo-v2')).photos?.['stu-sara']));
  console.log('ERRORS', JSON.stringify(errs), 'photoSaved', photo);
  await b.close();
})().catch((e) => { console.error('FAIL', e.message.split('\n')[0]); process.exit(1); });
