import express from "express";
import cors from "cors";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ✅ Fetch Live Matches
app.get("/live-matches", async (req, res) => {
  try {
    const { data } = await axios.get("https://www.espncricinfo.com/live-cricket-score");
    const $ = cheerio.load(data);
    
    let matches = [];

    $(".ds-px-4.ds-py-3").each((index, element) => {
      const title = $(element).find(".ds-text-tight-m.ds-font-bold").text().trim();
      const teams = $(element).find(".ds-text-tight-s.ds-font-bold").text().trim();
      const status = $(element).find(".ds-text-tight-s.ds-text-typo-title").text().trim();
      const score1 = $(element).find(".ds-text-compact-xs > strong").first().text().trim();
      const score2 = $(element).find(".ds-text-compact-xs > strong").last().text().trim();
      
      if (title && teams) {
        matches.push({
          title,
          team1: teams.split(" vs ")[0],
          team2: teams.split(" vs ")[1] || "TBA",
          score1,
          score2,
          status
        });
      }
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch live matches" });
  }
});

// ✅ Fetch Upcoming Matches
app.get("/upcoming-matches", async (req, res) => {
  try {
    const { data } = await axios.get("https://www.espncricinfo.com/fixtures");
    const $ = cheerio.load(data);
    
    let upcomingMatches = [];

    $(".ds-px-4.ds-py-3").each((index, element) => {
      const title = $(element).find(".ds-text-tight-m.ds-font-bold").text().trim();
      const date = $(element).find(".ds-text-tight-s.ds-text-typo-title").text().trim();

      if (title) {
        upcomingMatches.push({ title, date });
      }
    });

    res.json(upcomingMatches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch upcoming matches" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
