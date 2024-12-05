<template>
  <div>
    <h2>Blacklist Manager</h2>

    <ul>
      <li v-for="(url, index) in blacklist" :key="index">
        {{ url }}
        <button @click="removeFromBlacklist(url)">Remove</button>
      </li>
    </ul>

    <div>
      <input v-model="newBlacklistUrl" placeholder="Add URL to blacklist" />
      <button @click="addToBlacklist(newBlacklistUrl)">Add to Blacklist</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      blacklist: [],       // Holds the current blacklist
      newBlacklistUrl: "", // Holds the URL to add to the blacklist
      counter: 0,          // Holds the current counter value
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
        chrome.runtime.sendMessage({ action: "addToBlacklist", url }, (response) => {
          if (response.success) {
            this.fetchBlacklist(); // Refresh blacklist after addition
	    this.newBlacklistUrl = "";
          }
        });
      }
    },

    // Remove a URL from the blacklist
    removeFromBlacklist(url) {
      chrome.runtime.sendMessage({ action: "removeFromBlacklist", url }, (response) => {
        if (response.success) {
          this.fetchBlacklist(); // Refresh blacklist after removal
        }
      });
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
