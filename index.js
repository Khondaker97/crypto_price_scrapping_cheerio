const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

async function getPriceFeed() {
  try {
    const siteUrl = "https://coinmarketcap.com";

    const { data } = await axios(siteUrl);
    const coinArr = [];

    const $ = cheerio.load(data);
    const elemSelector =
      "#__next > div > div.main-content > div.sc-4vztjb-0.cLXodu.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr";
    const keys = [
      "rank",
      "Name",
      "Price",
      "1h",
      "24h",
      "7d",
      "MarketCap",
      "Volume",
      "CirculatingSupply",
    ];

    $(elemSelector).each((parentIdx, parentElem) => {
      const coinObj = {};
      if (parentIdx <= 9) {
        // console.log(parentIdx);
        $(parentElem)
          .children()
          .each((childIdx, childElem) => {
            let tdValue = $(childElem).text();
            if (childIdx - 1 === 1 || childIdx - 1 === 7) {
              tdValue = $("p:first-child", $(childElem).html()).text();
              //   console.log(tdValue);
            }
            if (tdValue) {
              coinObj[keys[childIdx - 1]] = tdValue;
            }
          });
        coinArr.push(coinObj);
      }
    });
    return coinArr;
  } catch (error) {
    res.send({ err: error.message, msg: "Check Your Network!" });
  }
}

const app = express();
app.use(express.json());

app.get("/api/price", async (req, res) => {
  try {
    const priceFeed = await getPriceFeed();

    return res.status(200).json({
      result: priceFeed,
    });
  } catch (error) {
    return res.status(500).json({
      err: error.toString(),
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Server is running!"));
