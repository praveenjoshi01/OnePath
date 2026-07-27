import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const artifactDir = '/Users/praveenjoshi/.gemini/antigravity-ide/brain/b8bdeac9-1e4d-4599-83dc-40b0d65ba6ad';
const videosDir = path.join(artifactDir, 'videos');

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

async function runDemo() {
  console.log('🚀 Starting Automated Client User Journey Demo Recording...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  // 1. Load Dashboard
  console.log('1. Loading Dashboard at http://localhost:3000');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, '01_dashboard_overview.png') });

  // 2. Open New Enquiry Modal
  console.log('2. Opening New Enquiry Modal...');
  await page.click('button:has-text("New Enquiry")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, '02_new_enquiry_modal.png') });

  // 3. Fill New Enquiry Form
  console.log('3. Filling prospective child details & testing auto-classification...');
  await page.fill('input[placeholder="e.g. Conor"]', 'Rory');
  await page.fill('input[placeholder="e.g. Kelly"]', 'Kelly');
  
  await page.locator('input[type="date"]').nth(0).fill('2025-02-14');
  await page.locator('input[type="date"]').nth(1).fill('2026-09-01');
  await page.waitForTimeout(800); // Trigger auto-suggest room recommendation API

  await page.fill('input[placeholder="e.g. Mary Kelly"]', 'Clara Kelly');
  await page.fill('input[placeholder="e.g. mary.k@example.ie"]', 'clara.kelly@example.ie');
  await page.fill('input[placeholder="+353 87 000 0000"]', '+353 87 555 1234');
  await page.check('#siblingPriority');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifactDir, '03_enquiry_form_filled.png') });

  // Submit Enquiry
  console.log('4. Submitting new enquiry...');
  await page.click('button:has-text("Save & Classify Enquiry")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, '04_enquiry_added_kanban.png') });

  // 5. Advance Stage in Kanban
  console.log('5. Advancing stage on Kanban board...');
  const advanceButtons = await page.$$('button[title="Advance to next stage"]');
  if (advanceButtons.length > 0) {
    await advanceButtons[0].click();
    await page.waitForTimeout(1200);
  }
  await page.screenshot({ path: path.join(artifactDir, '05_kanban_advanced.png') });

  // 6. Open API Sync Modal
  console.log('6. Triggering Vendor-Neutral API Sync Modal...');
  const syncButtons = await page.$$('button:has-text("Sync API")');
  if (syncButtons.length > 0) {
    await syncButtons[0].click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, '06_sync_modal_preview.png') });

    // Select Vendor & Export
    console.log('7. Exporting child record to TeachKloud...');
    await page.click('button:has-text("TeachKloud")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Export & Sync to TeachKloud")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactDir, '07_sync_success_result.png') });

    await page.click('button:has-text("Close")');
    await page.waitForTimeout(800);
  }

  // 7. Switch to Table View
  console.log('8. Switching to Data Table View...');
  await page.click('button:has-text("Data Table")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(artifactDir, '08_table_view.png') });

  // 8. Open Child Profile Inspection Modal
  console.log('9. Inspecting child details modal...');
  const viewButtons = await page.$$('button[title="View full details"]');
  if (viewButtons.length > 0) {
    await viewButtons[0].click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, '09_detail_modal_audit.png') });
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(800);
  }

  // 9. Task SLA Completion
  console.log('10. Toggling task SLA...');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, '10_demo_final.png') });

  // Save video
  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const targetVideoPath = path.join(artifactDir, 'enrollment_manager_user_journey_demo.webm');
    fs.copyFileSync(videoPath, targetVideoPath);
    console.log(`✅ User journey demo video successfully saved to: ${targetVideoPath}`);
  }

  console.log('✅ Demo Recording Finished Successfully!');
}

runDemo().catch(err => {
  console.error('Demo Recording Error:', err);
  process.exit(1);
});
