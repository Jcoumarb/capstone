// Retrieve the current blacklist from storage
function getBlacklisted(callback) {
    chrome.storage.local.get({ blacklist: [] }, (data) => {
        const blacklist = Array.isArray(data.blacklist) ? data.blacklist : [];
        console.log("Retrieved blacklist:", blacklist);
        callback(blacklist);
    });
}

// Check if a URL is blacklisted
function isBlacklisted(url, callback) {
    getBlacklisted((blacklist) => {
        const matched = blacklist.some((blacklistedUrl) => {
            return url.includes(blacklistedUrl);
        });
        console.log(`URL "${url}" is ${matched ? '' : 'not '}blacklisted.`);
        callback(matched);
    });
}

//function to create notification on point decrease
function decreaseNotification() {
	const id = "notif"

	chrome.notifications.create(
		id,
		{
			type:"basic",
			iconUrl: "lockedIn.png",
			title: "You Need to Locked In!",
			message: "You've visited a distracting website! Stay on task to gain points!"
		},
		(notificationId) => {
			if(chrome.runtime.lastError) {
				console.error("Notification error:", chrome.runtime.lastError.message);
			} else {
				console.log("Notification created with ID:", notificationId);
			}
		}
	);

	setTimeout(() => {
        	chrome.notifications.clear(id, (wasCleared) => {
            		if (wasCleared) {
                		console.log(`Notification ${id} cleared`);
            		} else {
                		console.log(`Failed to clear notification ${id}`);
            		}
        	});
    	}, 5000);
}

// Decrement the counter if a blacklisted URL is visited
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        isBlacklisted(changeInfo.url, (matched) => {
            if (matched) {
                console.log("Blacklisted URL visited:", changeInfo.url);

                // Decrement counter
                chrome.storage.local.get({ counter: 0 , isActive: false}, (data) => {
		    
		    if(!data.isActive) return;
                    const currentCounter = typeof data.counter === "number" ? data.counter : 0;
                    const updatedCounter = currentCounter - 2;

                    chrome.storage.local.set({ counter: updatedCounter }, () => {
                        console.log("Counter decremented. New value:", updatedCounter);

			decreaseNotification();
                    });
                });
            }
        });
    }
});

// Initialize local storage for work mode, counter, and blacklist on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isActive: false, counter: 0 , blacklist: [] }, () => {
        console.log('Initialized: Mode off, counter at 0.');
    });
});

//function to create notification on point increase
function increaseNotification() {
	const id = 'notif2'
	chrome.notifications.create(
		id,
		{
			type:"basic",
			iconUrl: "lockedIn.png",
			title: "You're Locked In!",
			message: "Great focus! Keep up the good work to gain more points!"
		},
		(notificationId) => {
			if(chrome.runtime.lastError) {
				console.error("Notification error:", chrome.runtime.lastError.message);
			} else {
				console.log("Notification created with ID:", notificationId);
			}
		}
	);

	setTimeout(() => {
        	chrome.notifications.clear(id, (wasCleared) => {
            		if (wasCleared) {
                		console.log(`Notification ${id} cleared`);
            		} else {
                		console.log(`Failed to clear notification ${id}`);
            		}
        	});
    	}, 5000);
}

// Logic for incrementing points when work mode is active
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'incrementCounter') {
        console.log('Alarm triggered: incrementCounter');

        chrome.storage.local.get(['isActive', 'counter'], (data) => {
            if (!data.isActive) {
                console.log('Mode is inactive, skipping increment.');
                return;
            }

            // Check the idle state
            chrome.idle.queryState(60, (state) => {
                if (state === 'active') {
                    const newCounter = (data.counter || 0) + 1;
                    chrome.storage.local.set({ counter: newCounter }, () => {
                        console.log(`Counter incremented to: ${newCounter}`);

			increaseNotification();
                    });
                } else {
                    console.log(`System idle (${state}), skipping increment.`);
                }
            });
        });
    }
});

// Toggle work mode (active/inactive) and create timer if active
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleMode') {
        chrome.storage.local.get('isActive', (data) => {
            const newMode = !data.isActive;
            chrome.storage.local.set({ isActive: newMode }, () => {
                console.log(`Mode changed: ${newMode ? 'Active' : 'Inactive'}`);
                if (newMode) {
                    chrome.alarms.create('incrementCounter', { periodInMinutes:  0.5});
                } else {
                    chrome.alarms.clear('incrementCounter');
                }
                sendResponse({ success: true, mode: newMode });
            });
        });
        return true; // Required for async response
    }
});

// Reset the counter
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'resetCounter') {
        chrome.storage.local.set({ counter: 0 }, () => {
            console.log('Counter reset to zero.');
            sendResponse({ success: true });
        });
        return true;
    }
});

// Add a URL to the blacklist
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'addToBlacklist') {
        chrome.storage.local.get({ blacklist: [] }, (data) => {
            const blacklist = Array.isArray(data.blacklist) ? data.blacklist : [];
            if (!blacklist.includes(message.url)) {
                blacklist.push(message.url);
                chrome.storage.local.set({ blacklist }, () => {
                    console.log('Added to blacklist:', message.url);
                    sendResponse({ success: true });
                });
            } else {
                sendResponse({ success: false });
            }
        });
        return true;
    }
});

// Remove a URL from the blacklist
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'removeFromBlacklist') {
        chrome.storage.local.get({ blacklist: [] }, (data) => {
            const blacklist = Array.isArray(data.blacklist) ? data.blacklist : [];
            const index = blacklist.indexOf(message.url);
            if (index !== -1) {
                blacklist.splice(index, 1);
                chrome.storage.local.set({ blacklist }, () => {
                    console.log('Removed from blacklist:', message.url);
                    sendResponse({ success: true });
                });
            } else {
                sendResponse({ success: false });
            }
        });
        return true;
    }
});
