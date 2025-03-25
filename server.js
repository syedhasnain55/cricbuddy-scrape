import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

const url = "https://www.cricbuzz.com/cricket-match/live-scores";

app.get("/", (req, res) => {
  res.send("✅ CricBuddy API is Running! Use /live-matches to get match data.");
});

app.get("/live-matches", async (req, res) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
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

      const status =
        matchDetails.find(".cb-text-complete").text().trim() ||
        matchDetails.find(".cb-text-live").text().trim() ||
        matchDetails.find(".cb-text-preview").text().trim() ||
        "Match Not Started";

      if (title && team1 && team2) {
        matches.push({ title, team1, score1, team2, score2, status });
      }
    });

    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
