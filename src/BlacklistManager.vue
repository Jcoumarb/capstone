<template>
    <div id="manage">
        <h2>
            <button id="lock" @click="toggleLocked">
                <img class="lockIcon" v-if="locked" src="./images/locked.png" />
                <img class="lockIcon" v-if="!locked" src="./images/unlocked.png" />
            </button>
            Distracting Websites</h2>
    
        <div id="input" v-if="!locked">
            <button @click="addToBlacklist(newBlacklistUrl)">
                <img src="./images/add.png" />
            </button>
            <input v-model="newBlacklistUrl" @keyup.enter="addToBlacklist(newBlacklistUrl)" placeholder="Add URL to blacklist" />
        </div>
    
        <ul>
            <li v-for="(url, index) in blacklist" :key="index">
                <button v-if="!locked" @click="removeFromBlacklist(url)">
                    <img src="./images/delete.png" />                    
                </button>
                {{ url }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  data() {
    return {
      blacklist: [], // Holds the current blacklist
      newBlacklistUrl: "", // Holds the URL to add to the blacklist
      counter: 0, // Holds the current counter value
      locked: false,
    };
  },
  mounted() {
    this.fetchBlacklist();
    this.fetchCounter();
    this.fetchLocked();
  },
  methods: {
    // Fetch the current blacklist from local storage
    fetchBlacklist() {
      chrome.storage.local.get({ blacklist: [] }, (data) => {
        this.blacklist = data.blacklist;
      });
    },

    // Fetch the current counter value from local storage
    fetchCounter() {
      chrome.storage.local.get({ counter: 0 }, (data) => {
        this.counter = data.counter;
      });
    },

    // Fetch the current locked value
    fetchLocked() {
        chrome.storage.local.get({ locked: false }, (data) => {
            this.locked = data.locked;
        });
    },

    //toggle locked
    toggleLocked() {
        chrome.storage.local.get("password", async (data) => {
            if (!data.password) {
                this.setupPassword();
            } else {
                if (this.locked) {
                    this.verifyPassword(data.password);
                } else {
                    chrome.runtime.sendMessage({ action: "toggleLock" }, (response) => {
                        if (response.success) {
                            this.locked = response.locked;
                        }
                    });
                }
            }
        });
    },

    setupPassword() {
        const newPassword = prompt("Create a password:");
        const confirmPassword = prompt("Confirm your password:");

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match. Try again.");
            return;
        }

        chrome.storage.local.set({ password: newPassword }, () => {
            alert("Password set! You can now lock/unlock edits.");
        });

        chrome.runtime.sendMessage({ action: "toggleLock" }, (response) => {
            if (response.success) {
                this.locked = response.locked;
            }
        });
    },

    verifyPassword(stored) {
        const enteredPassword = prompt("Enter your password to unlock:");
        if (!enteredPassword) return;


        if(enteredPassword !== stored) return;

        chrome.runtime.sendMessage({ action: "toggleLock" }, (response) => {
            if (response.success) {
                this.locked = response.locked;
            }
        });
    },

    /*
    //hashes entered password
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    },*/

    // Add a URL to the blacklist
    addToBlacklist(url) {
      if (url) {
        chrome.runtime.sendMessage(
          { action: "addToBlacklist", url },
          (response) => {
            if (response.success) {
              this.fetchBlacklist(); // Refresh blacklist after addition
              this.newBlacklistUrl = "";
            }
          }
        );
      }
    },

    // Remove a URL from the blacklist
    removeFromBlacklist(url) {
      chrome.runtime.sendMessage(
        { action: "removeFromBlacklist", url },
        (response) => {
          if (response.success) {
            this.fetchBlacklist(); // Refresh blacklist after removal
          }
        }
      );
    },
  },
  watch: {
    // Watch for changes in the counter value and update the component
    counter(newValue) {
      chrome.storage.local.set({ counter: newValue });
    },
  },
};
</script>

<style scoped>

@import url("https://fonts.googleapis.com/css2?family=Electrolize&display=swap");

* {
    font-family: "Electrolize", sans-serif;
    cursor: pointer;
}

#manage {
    min-height: 100vh;
    margin-top: 40px;
}

h2 {
    width: 100%;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
}

ul {
    list-style-type: none;
    margin-left: 28px;
    padding: 0;
}

li {
    text-decoration: none;
    color: white;
    font-size: 15px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

li button {
    margin-right: 10px;
}

button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    outline: none;
    margin-right: 10px;
}

#input button {
    margin-left: 5px;
}

button:hover {
    opacity: 80%;
}

img {
    max-width: 25px;
    height: auto;
    cursor: pointer;
    transition: all 0.2 ease-in-out;
}

#input {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;
    margin-bottom: 20px;
    border: none;
    outline: none;
}

input {
    width: 133px;
}

#lockIcon {
    max-width: 55px;
}
</style>
