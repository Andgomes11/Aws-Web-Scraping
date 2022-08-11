'use strict'
const chromium = require('@sparticuz/chrome-aws-lambda')
const general = []
exports.WebScraping = async function WebScraping(event, context) {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: false
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1
  })

  await page.setCookie({
    name: 'li_at',
    value:
      'AQEDATz526EEpCPEAAABgoP-XxcAAAGCqArjF04AjFjWALK9nUZL_Z862ohllK2UVhUea-EO0FeCnUpaJ65JaksxaXNQ_LQUXE79hcato47pi8rWNPtnAeaPmmCJg-9bM9nDLVm8Gzoo0_3GAO7_U5Nk',
    domain: '.www.linkedin.com',
    path: '/',
    expires: 1691607823.055108,
    size: 157,
    httpOnly: true,
    secure: true,
    session: false,
    sameSite: 'None',
    sameParty: false,
    sourceScheme: 'Secure',
    sourcePort: 443
  })

  for (const itemCountrie of event.countrie) {
    for (const itemCarrer of event.carrers) {
      await page.goto('https://www.linkedin.com/feed/')
      await page.type('[type="text"]', itemCarrer)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(10000)
      await page.click('[class="search-reusables__primary-filter"]')
      await page.waitForTimeout(10000)
      const count = await page.$('[class="jobs-search-box__text-input"]')
      await count.click({ clickCount: 3 })
      await page.type('[class="jobs-search-box__text-input"]', itemCountrie)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(10000)

      const titlist = await page.evaluate(() => {
        const nodeList = document.querySelectorAll('header h1, small')
        const h1Array = [...nodeList]

        const titlist = h1Array.map(({ textContent }) => ({
          textContent
        }))

        return titlist
      })
      await page.click('[class="search-reusables__primary-filter"]')
      await page.waitForTimeout(5000)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(5000)

      const [elements] = await page.$x(
        '//*[@id="search-reusables__filters-bar"]/ul/li[4]'
      )
      await elements.click()
      await page.waitForTimeout(5000)
      const [element2] = await page.$x("(//input[@type='text'])[2]")
      await element2.type(itemCountrie)
      await page.waitForTimeout(5000)
      await page.keyboard.press('ArrowDown')
      await page.waitForTimeout(5000)
      await page.keyboard.press('Enter')
      await page.click('[class="artdeco-button__text"]')
      await page.waitForTimeout(50000)

      const info = await page.evaluate(() => {
        const nodeList = document.querySelectorAll(
          '#main .search-results-container  h2'
        )
        const h2Array = [...nodeList]

        const info = h2Array.map(({ textContent }) => ({
          textContent
        }))

        return info
      })

      general.push(titlist.concat(info))
    }
  }

  await browser.close()
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'request made successfully',
        input: event.general
      },
      null,
      2
    )
  }
}
