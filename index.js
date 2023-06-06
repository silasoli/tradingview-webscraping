const puppeteer = require("puppeteer");

async function getPageContent() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://tradingview.com/symbols/EURUSD/technicals/");

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

  await browser.close();

  return elementTable;
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

  const pattern = /([A-Z][\w\s]+?) \(\d+\)(\d\.\d{5})(Sell|Buy|Neutral|—)/g;
  const objects = [...elementTable.matchAll(pattern)].map((match) => {
    const name = removeWordsAtStart(match[1].trim());
    const value = match[2];
    const action = match[3];
    return { name, value, action };
  });

  return objects;
}

async function getData() {
  console.log(new Date())
  const elementTable = await getPageContent();
  const objects = parseTableData(elementTable);

  for (const obj of objects) {
    console.log(obj);
  }
}

// Chama a função getData inicialmente
getData();

// Executa a função getData a cada 10 minutos
setInterval(getData, 10 * 60 * 1000);
