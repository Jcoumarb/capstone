<template>
    <div id="app">
        <header>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </header>
        <main>
            <h1>LOCKED IN</h1>

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
                <p id="counterLabel">FOCUS XP</p>
                <p id="score-text">HIGH SCORE</p>
            </div>

            <button id="mode" @click="toggleMode">{{ mode }}</button>

            <div id="options">
                <button id="mute" @click="toggleMute">
                    <img class="muteIcon" v-if="muted" src="./images/muted.png" />
                    <img class="muteIcon" v-if="!muted" src="./images/unmuted.png" />
                </button>
                <button id="showBlack" @click="toggleBlacklistManager">
                    {{ showBlacklistManager ? "MINIMIZE DISTRACTIONS" : "EDIT DISTRACTIONS" }}
                </button>
            </div>

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
          this.mode = this.isActive ? "END SESSION" : "BEGIN WORK";
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
          this.mode = this.isActive ? "END SESSION" : "BEGIN WORK";
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
    cursor: pointer;
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
    /* background-color: #374971; dark blue background */
    background-color: black;
    width: 300px;
    height: 300px;
    overflow-y: auto;
    margin-left: 0;
    border: none;
    outline: none;
}

#counter {
    font-size: 70px;
    color: #00d4ff;
    font-weight: bold;
    background: linear-gradient(45deg, #00d4ff 70%, #7a00ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-left: 5px;
}

#counterLabel {
    font-size: 12px;
    color: white;
    width: 100%;
    display: flex;
    justify-content: center;
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
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
}

img {
    height: 40px;
    width: auto;
}

#score {
    font-size: 70px;
    color: #ace76d;
    font-weight: bold;
    margin-left: 5px;
}

#score-text {
    font-size: 12px;
    color: white;
    width: 100%;
    display: flex;
    justify-content: center;
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
    /* background-color: #FEFA9A; bright yellow */
    /* background-color: #EEDC82; warm gold 
    background-color: #FFB347; orange */
    background-color: #D1A3FF;
    font-size: 20px;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 10px;
    box-shadow: inset 4px -8px 3px rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease-in-out;
    border: none;
    outline: none;
}

#mode:hover {
    opacity: 0.8;
}

#options {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

#mute {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    margin-right: 20px;
}

#muteIcon {
    max-height: 15px;
    width: auto;
    transition: all 0.2 ease-in-out;
    cursor: pointer;
}

#mute:hover {
    opacity: 0.8;
}

#showBlack {
    width: 120px;
    height: 45px;
    background: none;
    outline: none;
    color: white;
    border-radius: 5px;
    border: 2px solid white;
}

#showBlack:hover {
    opacity: 0.8;
}
</style>
