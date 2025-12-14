Module.register("MMM-DartsLive", {
  defaults: {
    competitionId: 3503,
    updateInterval: 30 * 1000 // 30 seconds
  },

  start() {
    this.matches = [];
    this.loaded = false;

    this.getData();
    setInterval(() => this.getData(), this.config.updateInterval);
  },

  getData() {
    this.sendSocketNotification("DARTS_GET_LIVE", {
      competitionId: this.config.competitionId
    });
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "DARTS_LIVE_DATA") {
      this.matches = payload;
      this.loaded = true;
      this.updateDom();
    }
  },

  getDom() {
    const wrapper = document.createElement("div");

    if (!this.loaded) {
      wrapper.innerHTML = "Loading live matches…";
      return wrapper;
    }

    if (this.matches.length === 0) {
      wrapper.innerHTML = "No live matches right now";
      return wrapper;
    }

    this.matches.forEach(match => {
      const row = document.createElement("div");
      row.className = "match-row";

      const players = document.createElement("div");
      players.className = "players bright small";
      players.innerHTML = `${match.home} vs ${match.away}`;

      const score = document.createElement("div");
      score.className = "score medium bright";
      score.innerHTML = `${match.homeScore} - ${match.awayScore}`;

      const status = document.createElement("div");
      status.className = "status small dimmed";
      status.innerHTML = match.status;

      row.appendChild(players);
      row.appendChild(score);
      row.appendChild(status);

      wrapper.appendChild(row);
    });

    return wrapper;
  }
});
