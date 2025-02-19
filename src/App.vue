<template>
  <div id="app">
    <header>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </header>
    <main>
      <h1>Locked In</h1>

      <div class="num-row">
        <div id="count">
          <img src="./images/points.webp" />
          <p id="counter">{{ counter }}</p>
        </div>
        <div id="high">
          <img src="./images/high.webp" />
          <p id="score">{{ highScore }}</p>
        </div>
      </div>
      <div class="label-row">
        <p id="counterLabel">PRODUCTIVITY SCORE</p>
        <p id="score-text">HIGH SCORE</p>
      </div>

      <button id="mode" @click="toggleMode">{{ mode }}</button>

      <button @click="toggleBlacklistManager">
        {{ showBlacklistManager ? "Close" : "Edit Blacklist" }}
      </button>

      <button id="mute" @click="toggleMute">
        {{ muted ? "Unmute" : "Mute" }}
      </button>

      <BlacklistManager v-if="showBlacklistManager" />
    </main>
  </div>
</template>

<script>
import BlacklistManager from "./BlacklistManager.vue";

export default {
  components: { BlacklistManager },
  data() {
    return {
      isActive: false,
      counter: 0,
      mode: "Enter Work Mode",
      showBlacklistManager: false,
      muted: false,
      onBreak: false,
      highScore: 0,
    };
  },
  methods: {
    toggleBlacklistManager() {
      this.showBlacklistManager = !this.showBlacklistManager;
    },
    endSession() {
      // Send a message to the background script to reset the counter
      chrome.runtime.sendMessage({ action: "resetCounter" }, (response) => {
        if (response.success) {
          console.log("Counter reset to zero.");
        } else {
          console.error("Failed to reset counter.");
        }
      });
    },
    fetchStatus() {
      chrome.storage.local.get(
        ["isActive", "counter", "muted", "onBreak", "highScore"],
        (data) => {
          this.isActive = data.isActive || false;
          this.counter = data.counter || 0;
          this.mode = this.isActive ? "End Session" : "Begin Work";
          this.muted = data.muted || false;
          this.onBreak = data.onBreak || false;
          this.highScore = data.highScore || 0;
        }
      );
    },
    toggleMode() {
      chrome.runtime.sendMessage({ action: "toggleMode" }, (response) => {
        if (response.success) {
          this.isActive = response.mode;
          this.mode = this.isActive ? "End Session" : "Begin Work";
          this.isActive ? null : this.endSession();
        }
      });
    },
    toggleMute() {
      chrome.runtime.sendMessage({ action: "toggleMute" }, (response) => {
        if (response.success) {
          this.muted = response.muted;
        }
      });
    },
  },
  mounted() {
    this.fetchStatus();
    // Listen for counter updates from storage
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.counter) {
        this.counter = changes.counter.newValue;
      }

      if (changes.highScore) {
        this.highScore = changes.highScore.newValue;
      }
    });
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Electrolize&display=swap");

* {
    font-family: "Electrolize", serif;
}

/*
html, body {
    box-sizing: border-box;
    width: 350px;
    height: 400px;
    margin: 0px;
    padding: 0;
    overflow: hidden;
    background-color: transparent;
    border-radius: 10px;
} */

#app {
    display: flex;
    flex-direction: column;
    /*justify-content: center;*/
    background-color: #374971;
    width: 300px;
    height: 300px;
    overflow-y: auto;
    margin-left: 0;
}

#counter {
    font-size: 70px;
    color: #00d4ff;
    font-weight: bold;
    background: linear-gradient(45deg, #00d4ff 70%, #7a00ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

#counterLabel {
    font-size: 12px;
    color: white;
    margin-right: 50px;
}

main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

h1 {
    color: white;
    border-radius: 10px;
    font-size: 30px;
    margin-bottom: 0;
    padding-bottom: 0;
}
.num-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 0;
    height: 20vh;
    margin-top: 10px;
    margin-bottom: 0;
}

.label-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    padding-top: 0;
}

img {
    height: 40px;
    width: auto;
}

#score {
    font-size: 70px;
    color: #ace76d;
    font-weight: bold;
}

#score-text {
    font-size: 12px;
    color: white;
}

#high {
    align-items: center;
    justify-content: center;
    display: flex;
    margin-bottom: 0;
    padding-bottom: 0;
}

#count {
    align-items: center;
    justify-content: center;
    display: flex;
    margin-right: 30px;
    margin-bottom: 0;
    padding-bottom: 0;
}

#mode {
    width: 60%;
    height: 40px;
    border-radius: 20px;
    background-color: #FEFA9A;
    font-size: 20px;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 10px;
    box-shadow: inset 2px -6px 6px rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease-in-out;
    border: none;
    outline: none;
}

</style>
