const puppeteer = require("puppeteer");

async function getPageContent() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://tradingview.com/symbols/EURUSD/technicals/");

  const findM10 = "Exponential Moving Average (10)";
  const findM20 = "Exponential Moving Average (20)";
  const currentValue = await getCurrentValue(page);

  const table = await getTable(page);

  await browser.close();

  const items = parseTableData(table);
  const M10 = getItemByName(findM10, items);
  const M20 = getItemByName(findM20, items);

  return decideAction(M10, M20, currentValue);
}

async function decideAction(M10, M20, currentValue) {
  console.log(`Valor atual: ${currentValue}`);
  console.log(`${M10.name}: ${M10.value}`);
  console.log(`${M20.name}: ${M20.value}`);

  if (currentValue < M10.value && currentValue <= M20.value) {
    return "Comprar";
  }

  if (currentValue >= M20.value && currentValue > M10.value) {
    return "Vender";
  }

  return null;
}

function getItemByName(name, items) {
  return items.find((item) => item.name === name);
}

async function getTable(page) {
  await page.waitForSelector(
    'button[role="tab"][aria-selected="false"][id="1m"]'
  );

  await page.click('button[role="tab"][aria-selected="false"][id="1m"]');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const elements = await page.$$(".tableWrapper-hvDpy38G");
  const elementTable = await page.evaluate(
    (element) => element.querySelector("table").textContent,
    elements[1]
  );

  return elementTable;
}

async function getCurrentValue(page) {
  const elements = await page.$$(".lastContainer-JWoJqCpY");
  const elementTable = await page.evaluate(
    (elem) => elem.querySelector("span").textContent,
    elements[0]
  );
  return elementTable.slice(0, -1);
}

function removeWordsAtStart(string) {
  const wordsAtStart = ["Sell", "Buy", "Neutral"];
  for (let word of wordsAtStart) {
    if (string.startsWith(word)) {
      string = string.slice(word.length).trim();
    }
  }
  return string;
}

function parseTableData(elementTable) {
  const prefix = "NameValueAction";
  elementTable = elementTable.substring(prefix.length);

  const pattern = /([A-Z][\w\s]+? \(\d+\))(\d\.\d{5})(Sell|Buy|Neutral|—)/g;
  const objects = Array.from(elementTable.matchAll(pattern), (match) => {
    const name = removeWordsAtStart(match[1].trim());
    const value = match[2];
    const action = match[3];
    return { name, value, action };
  });

  return objects;
}

async function getData() {
  while (true) {
    const result = await getPageContent();
    console.log(result);
    await new Promise((r) => setTimeout(r, 60000 * 2));
  }
}

getData();
