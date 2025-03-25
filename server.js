import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // ✅ Allow CORS

app.get("/", (req, res) => {
  res.send("Welcome to CricBuddy Live Match API! Use /live-matches to get match data.");
});

app.get("/live-matches", async (req, res) => {
  try {
    const url = "https://www.cricbuzz.com/cricket-match/live-scores";
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:110.0) Gecko/20100101 Firefox/110.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    const $ = cheerio.load(data);
    let matches = [];

    $("div[class*='cb-mtch-lst']").each((index, element) => {
      const matchDetails = $(element);
      const title = matchDetails.find("h3.cb-lv-scr-mtch-hdr").text().trim();
      const fullScoreText = matchDetails.find(".cb-scr-wll-chvrn").text().trim();
      const scoreParts = fullScoreText.split(/\s+(?=\w+\d)/);

      const team1 = scoreParts[0]?.match(/^[A-Z]+/)?.[0] || "N/A";
      const score1 = scoreParts[0]?.replace(/^[A-Z]+/, "").trim() || "N/A";

      const team2 = scoreParts[1]?.match(/^[A-Z]+/)?.[0] || "N/A";
      const score2 = scoreParts[1]?.replace(/^[A-Z]+/, "").trim() || "N/A";

      const status = matchDetails.find(".cb-text-complete").text().trim() || 
                    matchDetails.find(".cb-text-live").text().trim() ||
                    matchDetails.find(".cb-text-preview").text().trim();

      if (title && team1 && team2) {
        matches.push({
          title,
          team1,
          score1,
          team2,
          score2,
          status: status || "Match Not Started",
        });
      }
    });

    res.json({ matches });
  } catch (error) {
    console.error("❌ Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch live matches" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
