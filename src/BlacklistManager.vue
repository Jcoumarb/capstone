<template>
    <div id="manage">
        <h2>Distracting Websites</h2>
    
        <div id="input">
            <button @click="addToBlacklist(newBlacklistUrl)">
                <img src="./images/add.png" />
            </button>
            <input v-model="newBlacklistUrl" @keyup.enter="addToBlacklist(newBlacklistUrl)" placeholder="Add URL to blacklist" />
        </div>
    
        <ul>
            <li v-for="(url, index) in blacklist" :key="index">
                <button @click="removeFromBlacklist(url)">
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
    };
  },
  mounted() {
    this.fetchBlacklist();
    this.fetchCounter();
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
    margin-left: 10px;
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
    max-width: 20px;
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
</style>
