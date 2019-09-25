const puppeteer = require('puppeteer');

//test('Add two numbers', () => {

//const sum = 1 + 2;

// expect(sum).toEqual(3);
//});

let browser, page;

beforeEach(async () => {

  browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');

})

afterEach(async () => {
  //await browser.close();
})


test('The header has the correct text', async () => {

  const text = await page.$eval('a.brand-logo', el => el.innerHTML);//

  expect(text).toEqual('Blogoholic');
});

test('clicking login starts Oauth Flow', async () => {
  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/)
});

test.only('When signed in, show logout button', async () => {
  const id = '5cd9a46088f4842270c245b0';

  const Buffer = require('safe-buffer').Buffer;
  const sessionObject = {
    passport: {
      user: id
    }
  };

  const sessionString = Buffer.from(
    JSON.stringify(sessionObject)
  ).toString('base64');

  const Keygrip = require('keygrip');
  const keys = require('../config/keys')
  const keygrip = new Keygrip([keys.cookieKey]);
  const sig = keygrip.sign('session=' + sessionString);

  //console.log(sessionString, sig);

  await page.setCookie({ name: 'session', value: sessionString });
  await page.setCookie({ name: 'session.sig', value: sig });
  await page.goto('localhost:3000');

});