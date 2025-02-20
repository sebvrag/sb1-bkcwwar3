const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Délai entre les requêtes pour éviter d'être bloqué
const DELAY = 2000;

// Fonction pour attendre entre les requêtes
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour nettoyer le nom du joueur
const cleanPlayerName = (name) => {
  return name.replace(/\d+/g, '').trim();
};

async function scrapePlayerTransfers(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const transfers = [];

    // Parcourir l'historique des transferts
    $('.tm-player-transfer-history-grid').each((_, element) => {
      const season = $(element).find('.grid__cell--center').first().text().trim();
      const fromClub = $(element).find('.vereinsimg').first().attr('title');
      const toClub = $(element).find('.vereinsimg').last().attr('title');
      
      if (fromClub && toClub) {
        transfers.push({
          season,
          fromClub,
          toClub
        });
      }
    });

    return transfers;
  } catch (error) {
    console.error(`Erreur lors du scraping des transferts: ${error.message}`);
    return [];
  }
}

async function scrapeClubPlayers(clubUrl) {
  try {
    const response = await axios.get(clubUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const players = new Set();

    // Scraper la page des transferts du club
    $('.spielprofil_tooltip').each((_, element) => {
      const playerName = cleanPlayerName($(element).text());
      const playerUrl = $(element).attr('href');
      
      if (playerName && playerUrl) {
        players.add({
          name: playerName,
          url: `https://www.transfermarkt.com${playerUrl}`
        });
      }
    });

    return Array.from(players);
  } catch (error) {
    console.error(`Erreur lors du scraping des joueurs: ${error.message}`);
    return [];
  }
}

async function main() {
  try {
    // Charger les clubs depuis le fichier existant
    const clubsContent = fs.readFileSync(path.join(__dirname, '../data/clubs.js'), 'utf8');
    const clubsMatch = clubsContent.match(/export const clubs = (\[[\s\S]*\]);/);
    const clubs = JSON.parse(clubsMatch[1]);

    const playerConnections = {};

    console.log(`Début du scraping pour ${clubs.length} clubs...`);

    for (const club of clubs) {
      console.log(`Scraping des joueurs pour ${club.name}...`);
      
      // Scraper les joueurs du club
      const players = await scrapeClubPlayers(club.transfermarktUrl);
      
      for (const player of players) {
        console.log(`Scraping des transferts pour ${player.name}...`);
        
        const transfers = await scrapePlayerTransfers(player.url);
        
        // Créer les connexions entre les clubs pour chaque joueur
        transfers.forEach(transfer => {
          if (!playerConnections[transfer.fromClub]) {
            playerConnections[transfer.fromClub] = {};
          }
          if (!playerConnections[transfer.fromClub][transfer.toClub]) {
            playerConnections[transfer.fromClub][transfer.toClub] = new Set();
          }
          playerConnections[transfer.fromClub][transfer.toClub].add(player.name);
        });

        await wait(DELAY);
      }

      await wait(DELAY);
    }

    // Convertir les Sets en Arrays pour la sérialisation JSON
    const formattedConnections = {};
    for (const club1 in playerConnections) {
      formattedConnections[club1] = {};
      for (const club2 in playerConnections[club1]) {
        formattedConnections[club1][club2] = Array.from(playerConnections[club1][club2]);
      }
    }

    // Sauvegarder les données
    fs.writeFileSync(
      path.join(__dirname, '../data/playerConnections.js'),
      `export const playerConnections = ${JSON.stringify(formattedConnections, null, 2)};`
    );

    console.log('Scraping terminé avec succès !');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

main();