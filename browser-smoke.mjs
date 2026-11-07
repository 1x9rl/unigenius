import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const baseUrl = process.env.APP_BASE_URL || 'http://127.0.0.1:5000';
const executablePath = process.env.CHROMIUM_PATH || '/repl/tools/bin/chromium';
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.match(await page.title(), /UNI GENIUS/);
  await page.getByRole('heading', { name: /هندستك، بذكاء أكبر/ }).waitFor();
  await page.getByRole('button', { name: 'Language' }).click();
  await page.locator('nav .nav-item').nth(1).click();
  await page.getByRole('heading', { name: 'Your engineering tutor' }).waitFor();

  const healthResponse = await page.request.get(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  assert.equal(healthResponse.status(), 200);

  await page.getByLabel('Your engineering question').fill(
    'Calculate the Mach number for V=250 m/s and a=340 m/s. Show the equation and steps.',
  );
  await page.locator('.send-btn').click();

  if (!health.providerConfigured) {
    await page.locator('.chat-error').waitFor();
    assert.match(await page.locator('.chat-error').innerText(), /xAI|credentials|connection/i);
    assert.equal(await page.locator('.message.assistant .markdown-body').count(), 0);
    console.log('Browser text-chat failure state is explicit; no local answer is mislabeled as AI.');
  } else {
    await page.locator('.message.assistant .markdown-body').last().waitFor();
    assert.ok((await page.locator('.message.assistant .markdown-body').last().innerText()).length > 20);
    console.log(`Browser text question received an xAI response (${health.model}).`);
  }

  const questionImage = await page.evaluate(async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="300"><rect width="100%" height="100%" fill="white"/><text x="50" y="100" font-size="48" font-family="Arial" fill="black">Gas flow velocity V = 250 m/s</text><text x="50" y="180" font-size="48" font-family="Arial" fill="black">Speed of sound a = 340 m/s. Find Mach number.</text></svg>`;
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: 'mach-number-question.png',
    mimeType: 'image/png',
    buffer: Buffer.from(questionImage, 'base64'),
  });
  await page.getByLabel('Your engineering question').fill('Read the values in this image and solve the problem.');
  await page.locator('.send-btn').click();

  if (!health.providerConfigured) {
    await page.locator('.chat-error').waitFor();
    assert.match(await page.locator('.chat-error').innerText(), /xAI|credentials|connection/i);
    assert.ok(await page.locator('.message.user .message-attachment').count());
    console.log('Browser image upload reaches the chat; xAI credentials are required for vision analysis.');
  } else {
    await page.locator('.message.assistant .markdown-body').last().waitFor();
    assert.match(await page.locator('.message.assistant .markdown-body').last().innerText(), /0\.7|Mach|Ma/i);
    console.log('Browser image question received an xAI vision response.');
  }

  assert.deepEqual(consoleErrors, []);
  console.log('Browser smoke test passed.');
} finally {
  await browser.close();
}
