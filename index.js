const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { headless, race_id: raceID } = require('./config.json');
const delay = ms => new Promise(r => setTimeout(r, ms));

const play = async page => {
  await page.waitForSelector('table tbody tr td div div span[unselectable]');
  const data = await page.evaluate(() =>
    [...document.querySelectorAll('table tbody tr td div div span[unselectable]')].map(span => span.textContent),
  );

  await page.waitForSelector('.txtInput');
  const textField = await page.$('.txtInput');

  let status = await page.$('.gameStatusLabel');
  let text = await page.evaluate(status => status.textContent, status);
  while (text !== 'The race is on! Type the text below:') {
    status = await page.$('.gameStatusLabel');
    text = await page.evaluate(status => status.textContent, status);
    await delay(75);
  }

  for (let word of data) {
    await textField.type(word, { delay: Math.floor(Math.random() * 9) + 9 });
  }

  await textField.dispose();
};

puppeteer.launch({ headless }).then(async browser => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto(`https://play.typeracer.com?rt=${raceID}`);
  await page.waitForSelector('.raceAgainLink');
  await page.click('.raceAgainLink');
  await play(page);
});
