// Teacher workspace journey. Run with the app up: npm run e2e:teacher
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, '..', 'e2e-screens', 'teacher'); fs.mkdirSync(OUT, { recursive: true });
const B = process.env.BASE_URL || 'http://localhost:3000';
const errs = [];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const shot = n => p.screenshot({ path: `${OUT}/${n}.png` });
  const step = async (n, fn) => { try { await fn(); } catch (e) { errs.push(`step ${n}: ${e.message.split('\n')[0]}`); await shot('FAIL-' + n); } };

  await p.goto(B); await p.waitForTimeout(600);
  await step('signin', async () => {
    await p.click('button:has-text("Teacher / school staff")'); await p.waitForURL('**/signin**'); await p.waitForTimeout(400); await shot('01-signin');
    await p.click('button:has-text("Or use your school staff account")'); await p.waitForTimeout(200);
    await p.click('button:has-text("Continue")'); await p.waitForTimeout(200); await shot('02-signin-validation');
    await p.click('button:has-text("Sign in with UAE PASS")'); await p.waitForURL('**/onboarding', { timeout: 8000 });
    for (let i = 0; i < 3; i++) { await p.click('main button.btn-ink'); await p.waitForTimeout(250); }
    await p.waitForURL('**/app/today'); await p.waitForTimeout(900); await shot('03-today');
    await p.screenshot({ path: `${OUT}/03b-today-full.png`, fullPage: true });
  });
  await step('toolbar', async () => {
    await p.click('header button[aria-label="Quick actions"]'); await p.waitForTimeout(400); await shot('04-quick');
    await p.keyboard.press('Escape');
    await p.click('header button[aria-label="Search"]'); await p.waitForTimeout(300); await p.keyboard.type('sara'); await p.waitForTimeout(500); await shot('05-search');
    await p.keyboard.press('Escape');
    await p.click('header button[aria-label="Notifications"]'); await p.waitForTimeout(400); await shot('06-alerts'); await p.keyboard.press('Escape');
  });
  await step('classes', async () => {
    await p.click('nav button[aria-label="Classes"]'); await p.waitForURL('**/app/classes'); await p.waitForTimeout(600); await shot('07-classes');
    await p.click('text=8A Science >> nth=0'); await p.waitForURL('**/app/classes/cl-8a'); await p.waitForTimeout(600); await shot('08-class-overview');
    await p.click('role=tab[name=/Assignments/]'); await p.waitForTimeout(300);
    await p.click('button:has-text("Lab report")'); await p.waitForTimeout(500); await shot('09-grading');
    const input = p.locator('[data-grade-row]').first(); await input.fill('27'); await p.waitForTimeout(150);
    await p.click('button:has-text("Return grades")'); await p.waitForTimeout(400);
    await p.click('[role=dialog] >> nth=-1 >> button:has-text("Return grades")'); await p.waitForTimeout(600); await shot('10-returned');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.click('role=tab[name=/Gradebook/]'); await p.waitForTimeout(500); await shot('11-gradebook');
    await p.click('role=tab[name=/Attendance/]'); await p.waitForTimeout(300);
    await p.click('role=radio[name=/Omar/] >> nth=0').catch(() => {});
    await p.locator('[role=radiogroup]').nth(1).locator('[role=radio]').nth(2).click(); await p.waitForTimeout(200); await shot('12-attendance');
    await p.click('button:has-text("Send to school system")'); await p.waitForTimeout(400);
    await p.click('[role=dialog] button:has-text("Send to school system")'); await p.waitForTimeout(500); await shot('13-attendance-sent');
    await p.click('role=tab[name=/Students/]'); await p.waitForTimeout(300); await p.click('button:has-text("Sara K.")'); await p.waitForTimeout(500); await shot('14-student'); await p.keyboard.press('Escape');
  });
  await step('assignment', async () => {
    await p.goto(B + '/app/classes?new=1'); await p.waitForTimeout(700);
    await p.fill('input[placeholder*="circuits"]', 'Electric circuits worksheet'); await shot('15-new-assignment');
    await p.click('button:has-text("Publish assignment")'); await p.waitForTimeout(600); await shot('16-assignment-published');
  });
  await step('resources', async () => {
    await p.click('nav button[aria-label="Resources"]'); await p.waitForURL('**/app/resources'); await p.waitForTimeout(600); await shot('17-resources');
    await p.click('role=tab[name=/Teacher network/]'); await p.waitForTimeout(400);
    await p.click('button[aria-label="Filter resources"], [aria-label="Filter resources"] button:has-text("Filter")'); await p.waitForTimeout(300);
    await p.click('[role=option]:has-text("Grade")'); await p.waitForTimeout(300); await p.click('[role=option]:has-text("Grade 9")'); await p.keyboard.press('Escape'); await p.waitForTimeout(400); await shot('18-resources-filtered');
    await p.goto(B + '/app/resources?upload=1'); await p.waitForTimeout(600);
    await p.setInputFiles('input[type=file]', { name: 'circuits-quiz.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 sample') });
    await p.waitForTimeout(300); await p.click('[role=dialog] button:has-text("8A Science")'); await shot('19-upload');
    await p.click('[role=dialog] button:has-text("Upload") >> nth=-1'); await p.waitForTimeout(1500); await shot('20-uploaded');
  });
  await step('opportunities', async () => {
    await p.click('nav button[aria-label="Students"]'); await p.waitForURL('**/app/opportunities'); await p.waitForTimeout(600); await shot('21-opps');
    await p.click('button:has-text("Junior Robotics Challenge")'); await p.waitForTimeout(500); await shot('22-opp-detail');
    await p.click('[role=dialog] button:has-text("Recommend (")'); await p.waitForTimeout(300);
    await p.click('[role=dialog] >> nth=-1 >> button:has-text("Recommend")'); await p.waitForTimeout(600);
    await p.click('button:has-text("Smart City Youth Hackathon")').catch(async () => { await p.click('role=tab[name=/Discover/]'); });
    await p.waitForTimeout(400); await p.click('[role=dialog] button:has-text("Ask school to sponsor")'); await p.waitForTimeout(300);
    await p.fill('[role=dialog] textarea', 'Links to our forces unit and represents the school.'); await p.click('[role=dialog] button:has-text("Send request")'); await p.waitForTimeout(300);
    await p.click('[role=dialog] >> nth=-1 >> button:has-text("Send request")'); await p.waitForTimeout(500);
    await p.click('role=tab[name=/Recommended/]'); await p.waitForTimeout(400); await shot('23-tracking');
  });
  await step('growth', async () => {
    await p.click('nav button[aria-label="Career"]'); await p.waitForURL('**/app/growth'); await p.waitForTimeout(600); await shot('24-schools');
    await p.click('button:has-text("Creek Science Academy")'); await p.waitForTimeout(500); await shot('25-school-detail'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await p.click('role=tab[name=/Jobs/]'); await p.waitForTimeout(300); await shot('26-jobs');
    await p.click('role=tab[name=/Network/]'); await p.waitForTimeout(300); await p.click('button:has-text("Connect") >> nth=0'); await p.waitForTimeout(2600); await shot('27-network');
  });
  await step('ai', async () => {
    await p.click('header a[aria-label="SAWA AI"]'); await p.waitForURL('**/app/ask'); await p.waitForTimeout(500); await shot('28-ai-empty');
    await p.click('button:has-text("Al Diyafah")'); await p.waitForSelector('text=Not in SAWA', { timeout: 20000 }); await p.waitForTimeout(400); await shot('29-ai-unknown-school');
    await p.fill('input[aria-label="Your question"]', "I've received a job offer from Creek Science Academy. What should I know?"); await p.keyboard.press('Enter');
    await p.waitForSelector('text=Questions to ask', { timeout: 20000 }); await p.waitForTimeout(400); await shot('30-ai-school');
    await p.fill('input[aria-label="Your question"]', 'What competitions are available for students aged 14-16 in Dubai?'); await p.keyboard.press('Enter');
    await p.waitForTimeout(2500); await shot('31-ai-competitions');
    await p.fill('input[aria-label="Your question"]', "Draft a message to 8A parents about next week's science quiz"); await p.keyboard.press('Enter');
    await p.waitForSelector('text=Review and post', { timeout: 20000 }); await p.waitForTimeout(300); await shot('32-ai-draft');
    await p.click('a:has-text("Review and post")'); await p.waitForURL('**/app/post**'); await p.waitForTimeout(500); await shot('33-post-prefilled');
  });
  await step('rtl', async () => {
    await p.goto(B + '/app/today'); await p.waitForTimeout(500);
    await p.click('header button[aria-label="Language"]'); await p.waitForTimeout(300); await p.click('[role=radio]:has-text("العربية")'); await p.waitForTimeout(700); await p.keyboard.press('Escape'); await shot('34-today-ar');
    await p.goto(B + '/app/classes/cl-8a'); await p.waitForTimeout(600); await shot('35-class-ar');
  });
  await step('desktop', async () => {
    await p.setViewportSize({ width: 1280, height: 860 });
    await p.goto(B + '/app/today'); await p.waitForTimeout(500);
    await p.click('header button[aria-label="اللغة"]'); await p.waitForTimeout(300); await p.click('[role=radio]:has-text("English")'); await p.waitForTimeout(600); await p.keyboard.press('Escape');
    await shot('36-desktop-today');
    await p.goto(B + '/app/classes/cl-8a?tab=gradebook'); await p.waitForTimeout(600); await shot('37-desktop-gradebook');
    await p.goto(B + '/app/opportunities'); await p.waitForTimeout(600); await shot('38-desktop-opps');
  });
  for (const w of [390, 1280]) {
    await p.setViewportSize({ width: w, height: 844 });
    for (const r of ['/app/today', '/app/classes', '/app/resources', '/app/opportunities', '/app/growth', '/app/ask']) {
      await p.goto(B + r); await p.waitForTimeout(400);
      if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) errs.push(`overflow at ${w}px on ${r}`);
    }
  }
  console.log('ERRORS', JSON.stringify(errs, null, 1));
  await b.close();
})().catch(e => { console.error('FAIL', e.message, JSON.stringify(errs.slice(-6))); process.exit(1); });
