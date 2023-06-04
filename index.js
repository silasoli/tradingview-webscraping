const puppeteer = require("puppeteer");

async function getPageContent() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://tradingview.com/symbols/EURUSD/technicals/");

  await page.waitForSelector(
    'button[role="tab"][aria-selected="false"][id="15m"]'
  );

  await page.click('button[role="tab"][aria-selected="false"][id="15m"]');

  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const elements = await page.$$(".tableWrapper-hvDpy38G");

  const elementTable = await page.evaluate(
    (element) => element.querySelector("table").textContent,
    elements[1]
  );

  await browser.close();

  return elementTable;
}

function parseTableData(elementTable) {
  const prefix = "NameValueAction";
  elementTable = elementTable.substring(prefix.length);

  const pattern = /([A-Z][\w\s]+? \(\d+\))(\d\.\d{5})(Sell|Buy|Neutral|—)/g;
  const objects = [...elementTable.matchAll(pattern)].map((match) => ({
    name: match[1],
    value: match[2],
    action: match[3],
  }));

  return objects;
}

async function getData() {
  const elementTable = await getPageContent();
  const objects = parseTableData(elementTable);

  for (const obj of objects) {
    console.log(obj);
  }
}

getData();
