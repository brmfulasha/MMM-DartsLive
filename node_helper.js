const NodeHelper = require("node_helper");
const https = require("https");

module.exports = NodeHelper.create({
  start() {
    console.log("MMM-DartsLive helper started");
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "DARTS_GET_LIVE") {
      this.getLiveMatches(payload.competitionId);
    }
  },

  getLiveMatches(competitionId) {
    const options = {
      method: "GET",
      hostname: "darts-api.p.rapidapi.com",
      port: null,
      path: `/competitions/${competitionId}`,
      headers: {
        "x-rapidapi-host": "darts-api.p.rapidapi.com",
        "x-rapidapi-key": "YOUR_API_KEY_HERE",
        "Accept": "application/json"
      }
    };

    const req = https.request(options, res => {
      const chunks = [];

      res.on("data", chunk => chunks.push(chunk));

      res.on("end", () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());

          const live = (data.events || [])
            .filter(e => e.status === "inplay" || e.status === "live")
            .map(e => ({
              home: e.home?.name || "Player A",
              away: e.away?.name || "Player B",
              homeScore: e.home?.score || 0,
              awayScore: e.away?.score || 0,
              status: e.status
            }));

          this.sendSocketNotification("DARTS_LIVE_DATA", live);
        } catch (err) {
          console.error("MMM-DartsLive parse error:", err);
        }
      });
    });

    req.on("error", err => {
      console.error("MMM-DartsLive API error:", err);
    });

    req.end();
  }
});
