const axios =  require("axios");
const xml2js = require("xml2js");


const RSS_FEED =  "https://www.reuters.com/arc/outboundfeeds/sitemap-index/?outputType=xml";

async function fetchNews(){
   try {
    const {data} = await axios.get(RSS_FEED);

    const parsed = await xml2js.parseStringPromise(data);

    const newsItems = parsed?.sitemapindex?.sitemap || [];

    const articles = newsItems.slice(0,50).map((item)=>({
        url: item.loc[0],
        lastModified: item.lastmod ? item.lastmod[0]:null,
    }));
    return articles;
   } catch (error) {
    console.log("Error fetching news", error.message);
    return [];
   }
}

module.exports = {fetchNews};