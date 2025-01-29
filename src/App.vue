<template>
	<div id="app">
		<header>
			<h1>Locked In</h1>
		</header>
		<main>
			<p id="counter">{{ counter }}</p>
			<h2>currency(placeholder)</h2>
			<button id="mode" @click="toggleMode">{{ mode }}</button>
			<button @click="toggleBlacklistManager">{{ showBlacklistManager ? "Close" : "Edit Blacklist" }}</button>
			<button id="mute" @click="toggleMute">{{ muted ? "Unmute" : "Mute"}}</button>
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
        		chrome.runtime.sendMessage({ action: 'resetCounter' }, (response) => {
            			if (response.success) {
                			console.log('Counter reset to zero.');
            			} else {
                			console.error('Failed to reset counter.');
            			}
        		});
    		},
		fetchStatus() {
      			chrome.storage.local.get(['isActive', 'counter', 'mute', 'onBreak', 'highScore'], (data) => {
        			this.isActive = data.isActive || false;
        			this.counter = data.counter || 0;
        			this.mode = this.isActive ? "Exit Work Mode" : "Enter Work Mode";
				this.muted = data.muted || false;
				this.onBreak = data.onBreak || false;
				this.highScore = data.highScore || 0;
     	 		});
    		},
    		toggleMode() {
      			chrome.runtime.sendMessage({ action: "toggleMode" }, (response) => {
        			if (response.success) {
          				this.isActive = response.mode;
          				this.mode = this.isActive ? "Exit Work Mode" : "Enter Work Mode";
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
    		});
	},
};
</script>

<style scoped>
#app {
	display: flex;
	flex-direction: column;
	/*justify-content: center;*/
	background-color: #b0b0b0;
	width: 300px;
	height: 400px;
}

#counter {
	font-size: 100px;
	color: white;
	font-weight: bold;
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 0px;
}

header {
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
	background-color: orange;
	padding: 10px;
	border-radius: 10px;
}
</style>
