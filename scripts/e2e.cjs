const { chromium } = require('playwright');
const OUT = require('path').join(__dirname, '..', 'e2e-screens'); require('fs').mkdirSync(OUT, { recursive: true }); const errs = [];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();

  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const B = process.env.BASE_URL || 'http://localhost:3000';
  const shot = n => p.screenshot({ path: `${OUT}/${n}.png`, fullPage: false });
  await p.goto(B); await p.waitForTimeout(800); await shot('01-landing');
  await p.click('button:has-text("Parent / guardian")'); await p.waitForURL('**/signin**'); await p.waitForTimeout(500); await shot('02-signin');
  await p.click('button:has-text("Sign in with UAE PASS")'); await p.waitForURL('**/onboarding', { timeout: 8000 }); await p.waitForTimeout(400);
  await p.waitForTimeout(2400); await shot('02b-family-match'); await p.click('main button.btn-glass'); // match → priorities
  await p.waitForTimeout(700); await p.click('[role=option][aria-label="Fees"]'); await p.waitForTimeout(300); await shot('02c-priorities'); await p.click('main button.btn-glass');
  await p.waitForTimeout(600); await p.click('main button.btn-glass'); // controls → documents
  await p.waitForTimeout(600); await p.click('button:has-text("Sample") >> nth=0'); await p.waitForTimeout(1600); await shot('02d-documents'); await p.click('main button.btn-glass');
  await p.waitForTimeout(4200); await shot('02e-tools'); await p.click('main button.btn-glass'); // tools → done
  await p.waitForTimeout(700); await p.click('main button.btn-glass'); // done → app
  await p.waitForURL('**/app/today'); await p.waitForTimeout(800); await shot('03-parent-today');
  await p.click('a:has-text("Update now")'); await p.waitForTimeout(600); await shot('04-journey-check');
  await p.click('button:has-text("Upload the renewed ID")');
  await p.click('button:has-text("Use the sample card")');
  await p.waitForSelector('text=These are correct', { timeout: 20000 }); await shot('05-extracted');
  await p.click('button:has-text("These are correct")'); await p.waitForTimeout(300); await shot('06-confirm');
  await p.click('button:has-text("Confirm & submit")'); await p.waitForTimeout(600); await shot('07-done');
  // teacher posts + office
  await p.goto(B + '/app/profile'); await p.click('button:has-text("Teacher")'); await p.waitForURL('**/app/today');
  await p.goto(B + '/app/post'); await p.click('button:has-text("Post")>>nth=-1'); await p.waitForTimeout(400); await shot('08-teacher-post');
  await p.goto(B + '/app/office'); await p.click('button:has-text("Approve & complete")'); await p.waitForTimeout(300); await shot('09-office');
  await p.goto(B + '/app/today'); await p.waitForTimeout(1000); await shot('09b-teacher-today');
  await p.goto(B + '/app/students'); await p.waitForTimeout(600); await p.click('button:has-text("New event")'); await p.fill('input[placeholder*="Coding day"]', 'Coding day for Grade 8'); await p.click('button:has-text("Create and invite")'); await p.waitForTimeout(600); await shot('09c-teacher-event');
  // student
  await p.evaluate(() => { const k = 'sawa-demo-v2'; const s = JSON.parse(localStorage.getItem(k)); s.onboarded['stu-sara'] = true; localStorage.setItem(k, JSON.stringify(s)); });
  await p.goto(B + '/app/profile'); await p.click('button:has-text("Student")'); await p.waitForURL('**/app/today'); await p.waitForTimeout(500); await shot('10-student-today');
  await p.goto(B + '/app/opportunities/op-1'); await p.waitForTimeout(600);
  await p.click('button:has-text("Ask my guardian")'); await p.waitForTimeout(500); await shot('11-explore');
  // parent approves
  await p.goto(B + '/app/profile'); await p.click('button:has-text("parent")'); await p.waitForURL('**/app/today'); await p.waitForTimeout(500); await shot('13-parent-today2');
  await p.goto(B + '/app/services'); await p.waitForTimeout(900); await shot('13b-services');
  await p.goto(B + '/app/approvals'); await p.waitForTimeout(500); await shot('14-approvals'); await p.click('button:has-text("Approve") >> nth=0');
  // ask in arabic
  await p.goto(B + '/app/ask'); await p.click(`button:has-text("ابنتي")`); await p.waitForSelector("text=Sources", { timeout: 15000 }); await p.waitForTimeout(400); await shot('15-ask');
  // arabic RTL
  await p.goto(B + '/app/today'); await p.click('button[aria-label="Language"]'); await p.click('button[role="radio"]:has-text("العربية")'); await p.waitForTimeout(600); await shot('16-rtl-today');
  await p.goto(B + '/app/impact'); await p.waitForTimeout(300); await shot('17-impact-ar');
  await p.goto(B + '/app/data'); await p.waitForTimeout(300); await shot('18-data-ar');
  // desktop landing
  await p.setViewportSize({ width: 1280, height: 800 }); await p.goto(B + '/app/profile'); await p.click('button:has-text("تسجيل الخروج")'); await p.waitForTimeout(500); await shot('19-landing-desktop-ar');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('ERRORS', JSON.stringify(errs, null, 1), 'overflow', overflow);
  await b.close();
})().catch(e => { console.error("FAIL", e.message, JSON.stringify(errs.slice(-6))); process.exit(1); });
