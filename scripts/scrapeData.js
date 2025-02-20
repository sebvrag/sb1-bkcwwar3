const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const leagues = [
  // England
  { url: 'https://www.transfermarkt.com/premier-league/startseite/wettbewerb/GB1', country: 'England' },
  { url: 'https://www.transfermarkt.com/championship/startseite/wettbewerb/GB2', country: 'England' },
  // Spain
  { url: 'https://www.transfermarkt.com/laliga/startseite/wettbewerb/ES1', country: 'Spain' },
  { url: 'https://www.transfermarkt.com/laliga2/startseite/wettbewerb/ES2', country: 'Spain' },
  // Germany
  { url: 'https://www.transfermarkt.com/bundesliga/startseite/wettbewerb/L1', country: 'Germany' },
  { url: 'https://www.transfermarkt.com/2-bundesliga/startseite/wettbewerb/L2', country: 'Germany' },
  // Italy
  { url: 'https://www.transfermarkt.com/serie-a/startseite/wettbewerb/IT1', country: 'Italy' },
  { url: 'https://www.transfermarkt.com/serie-b/startseite/wettbewerb/IT2', country: 'Italy' },
  // France
  { url: 'https://www.transfermarkt.com/ligue-1/startseite/wettbewerb/FR1', country: 'France' },
  { url: 'https://www.transfermarkt.com/ligue-2/startseite/wettbewerb/FR2', country: 'France' },
];

async function scrapeClubs() {
  const clubs = [];
  
  for (const league of leagues) {
    try {
      const response = await axios.get(league.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      $('.vereinslink').each((_, element) => {
        const name = $(element).text().trim();
        const url = $(element).attr('href');
        
        if (name && url) {
          clubs.push({
            name,
            country: league.country,
            transfermarktUrl: `https://www.transfermarkt.com${url}`,
          });
        }
      });

      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping ${league.country}: ${error.message}`);
    }
  }

  return clubs;
}

async function main() {
  try {
    const clubs = await scrapeClubs();
    fs.writeFileSync(
      './data/clubs.js',
      `export const clubs = ${JSON.stringify(clubs, null, 2)};`
    );
    console.log(`Successfully scraped ${clubs.length} clubs`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();