//end break sound
async function endBreakSound(source = 'endBreak.mp3', volume = 0.5) {
    try {
        await createOffscreen();
   
        // Send the message and handle potential errors
        await chrome.runtime.sendMessage({ play: { source, volume }, type: "endBreakMessage" })
            .catch(() => {});
    } catch (error) {
        //no logging as it works
    }
}

//start break sound
async function startBreakSound(source = 'startBreak.mp3', volume = 0.5) {
    try {
        await createOffscreen();
   
        // Send the message and handle potential errors
        await chrome.runtime.sendMessage({ play: { source, volume }, type: "startBreakMessage" })
            .catch(() => {});
    } catch (error) {
        //no logging as it works
    }
}

//point loss sound
async function pointLossSound(source = 'pointLoss.mp3', volume = 0.5) {
    try {
        await createOffscreen();
   
        // Send the message and handle potential errors
        await chrome.runtime.sendMessage({ play: { source, volume }, type: "pointLossMessage" })
            .catch(() => {});
    } catch (error) {
        //no logging as it works
    }
}

//high score sound
async function highScoreSound(source = 'highScore.mp3', volume = 0.5) {
    try {
        await createOffscreen();
   
        // Send the message and handle potential errors
        await chrome.runtime.sendMessage({ play: { source, volume }, type: "highScoreMessage" })
            .catch(() => {});
    } catch (error) {
        //no logging as it works
    }
}

//coin increase sound
async function coinSound(source = 'coinIncrease.mp3', volume = 0.5) {
    try {
        await createOffscreen();
   
        // Send the message and handle potential errors
        await chrome.runtime.sendMessage({ play: { source, volume }, type: "coinMessage" })
            .catch(() => {});
    } catch (error) {
        //no logging as it works
    }
}


// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'testing' // details for using the API
    });
}

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
        console.log(`URL "${url}" is ${matched ? "" : "not "}blacklisted.`);
        callback(matched);
    });
}

//end break notification
function endBreakNotification() {
    const id = "notif";

    chrome.notifications.create(
        id,
        {
            type: "basic",
            iconUrl: "lockedIn.png",
            title: "It's Time to lock in!",
            message:"Your break is now over",
        },
        (notificationId) => {
            if (chrome.runtime.lastError) {
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


function startBreakNotification() {
    const id = "notif";

    chrome.notifications.create(
        id,
        {
            type: "basic",
            iconUrl: "lockedIn.png",
            title: "Break Time!",
            message:"Great focus! You can now visit distracting websites for 5 minutes",
        },
        (notificationId) => {
            if (chrome.runtime.lastError) {
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

//function to create notification on point decrease
function decreaseNotification() {
    const id = "notif";

    chrome.notifications.create(
        id,
        {
            type: "basic",
            iconUrl: "lockedIn.png",
            title: "You Need to Lock In!",
            message:"You've visited a distracting website! Stay on task to gain points!",
        },
        (notificationId) => {
            if (chrome.runtime.lastError) {
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

// Decrement the counter if a blacklisted URL is visited (this is intentionally not subject to mute)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        isBlacklisted(changeInfo.url, (matched) => {
            if (matched) {
                console.log("Blacklisted URL visited:", changeInfo.url);

                // Decrement counter
                chrome.storage.local.get({ counter: 0, isActive: false, muted: false , onBreak: false }, (data) => {
                    if (!data.isActive) return;
                    if (data.onBreak) return;

                    const currentCounter = typeof data.counter === "number" ? data.counter : 0;
                    const updatedCounter = currentCounter - 2;


                    chrome.storage.local.set({ counter: updatedCounter }, () => {
                        console.log("Counter decremented. New value:", updatedCounter);
                        decreaseNotification();
                        pointLossSound();
                    });
                });
            }
        });
  }
});

// Initialize local storage of all variables
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isActive: false, counter: 0, blacklist: [], muted: false, onBreak: false, highScore: 0, highScoreNotified: false, locked: false, password: null , breakCount: 0 },
    () => {
        console.log("Initialized all local storage");
    });
});

//function to create notification on point increase
function increaseNotification() {
    const id = "notif2";
    chrome.notifications.create(
        id,
        {
            type: "basic",
            iconUrl: "lockedIn.png",
            title: "You're Locked In!",
            message: "Great focus! Keep up the good work to gain more points!",
        },
        (notificationId) => {

            coinSound();

            if (chrome.runtime.lastError) {
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

//function to create notification on point increase
function highScoreNotification() {
    const id = "notif3";
    chrome.notifications.create(
        id,
        {
            type: "basic",
            iconUrl: "lockedIn.png",
            title: "You've Reached a New High Score!",
            message:"Great job on the sustained focus! Keep up the good work to gain more points!",
        },
        (notificationId) => {
            if (chrome.runtime.lastError) {
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
    if (alarm.name === "incrementCounter") {
        console.log("Alarm triggered: incrementCounter");

        chrome.storage.local.get(["isActive", "counter", "muted", "highScore", "highScoreNotified", "onBreak", "breakCount" ], (data) => {
            if (!data.isActive) {
                console.log("Mode is inactive, skipping increment.");
                return;
            }

            //increment breakCount and follow logic of on break
            const breakIncrease = (data.breakCount || 0) + 1;
            chrome.storage.local.set({ breakCount: breakIncrease }, () => {
                console.log(`breakCount incremented to: ${breakIncrease}`);
            });

            let notified = false;

            if (data.onBreak) {
                if(breakIncrease === 1) {
                    //end break Notification and counter reset and toggle onBreak
                    endBreakNotification();
                    endBreakSound();
                    notified = true;

                    chrome.storage.local.set({ onBreak: false }, () => {
                        console.log(`Break has ended`);
                    });
 
                    chrome.storage.local.set({ breakCount: 0 }, () => {
                        console.log(`Break has ended`);
                    });
                }
            } else {
                if(breakIncrease === 6) {
                    //break notification and counter reset and toggle onBreak
                    startBreakNotification();
                    startBreakSound();
                    notified = true;

                    chrome.storage.local.set({ onBreak: true }, () => {
                        console.log(`Break has started`);
                    });
 
                    chrome.storage.local.set({ breakCount: 0 }, () => {
                        console.log(`Break has started`);
                    });
                }
            }

            // Check the idle state and only increases points if active
            chrome.idle.queryState(60, (state) => {
                if (state === "active") {
                    //increase counter
                    const newCounter = (data.counter || 0) + 1;
                    chrome.storage.local.set({ counter: newCounter }, () => {
                        console.log(`Counter incremented to: ${newCounter}`);
                    });

                    //if there is a new high score, it is set 
                    if (newCounter > data.highScore) {
                        chrome.storage.local.set({ highScore: newCounter }, () => {
                            console.log(`New high score of ${newCounter}`);
                        });

                        //high score is only notified if it is the first time for the session
                        if (!data.highScoreNotified && !data.muted && !notified) {
                            highScoreNotification();
                            highScoreSound();

                            chrome.storage.local.set({ highScoreNotified: true }, () => {
                                console.log("HighScoreNotified set true");
                            });
                        } else if (!data.muted && !notified) {
                            increaseNotification();
                            coinSound();
                        }
                    } else if (!data.muted && !notified) {
                        increaseNotification();
                        coinSound();
                    }

                } else {
                    //skips increment if chrome is idle
                    console.log(`System idle (${state}), skipping increment.`);
                }
            });
        });
    }
});

// Toggle work mode (active/inactive) and create timer if active
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleMode") {
        chrome.storage.local.get("isActive", (data) => {
            const newMode = !data.isActive;
            chrome.storage.local.set({ isActive: newMode }, () => {
                console.log(`Mode changed: ${newMode ? "Active" : "Inactive"}`);
                
                if (newMode) {
                    chrome.alarms.create("incrementCounter", { periodInMinutes: 5 });
                } else {
                    chrome.alarms.clear("incrementCounter");
                }
        
                sendResponse({ success: true, mode: newMode });
            });
        });
    
        return true; // Required for async response
    }
});

//toggle mute which will allow/disallow notifications of point gain and loss
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleMute") {
        chrome.storage.local.get("muted", (data) => {
            const newMute = !data.muted;
            chrome.storage.local.set({ muted: newMute }, () => {
                console.log(`Mute set: ${newMute}`);
                sendResponse({ success: true, muted: newMute });
            });
        });
    
        return true;
    }
});


//toggle locked which is used to enable/disable edits to blacklisted URLs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleLock") {
        chrome.storage.local.get("locked", (data) => {
            const newlock = !data.locked;
            chrome.storage.local.set({ locked: newlock }, () => {
                console.log(`Locked set: ${newlock}`);
                sendResponse({ success: true, locked: newlock });
            });
        });
    
        return true;
    }
});

// Reset the counter and highScoreNotified at the end of session
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "resetCounter") {
        chrome.storage.local.set({ counter: 0 }, () => {
            console.log("Counter variable reset");
            sendResponse({ success: true });
        });

        chrome.storage.local.set({ highScoreNotified: false }, () => {
            console.log("highScoreNotified viarbale reset");
        });


        chrome.storage.local.set({ onBreak: false }, () => {
                console.log(`onBreak variable reset`);
        });
 
        chrome.storage.local.set({ breakCount: 0 }, () => {
            console.log(`breakCount variable reset`);
        });

        return true;
    }
});

// Add a URL to the blacklist
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "addToBlacklist") {
        chrome.storage.local.get({ blacklist: [] }, (data) => {
            const blacklist = Array.isArray(data.blacklist) ? data.blacklist : [];
      
            if (!blacklist.includes(message.url)) {
                blacklist.push(message.url);
                chrome.storage.local.set({ blacklist }, () => {
                    console.log("Added to blacklist:", message.url);
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
    if (message.action === "removeFromBlacklist") {
        chrome.storage.local.get({ blacklist: [] }, (data) => {
            const blacklist = Array.isArray(data.blacklist) ? data.blacklist : [];
            const index = blacklist.indexOf(message.url);
      
            if (index !== -1) {
                blacklist.splice(index, 1);
                chrome.storage.local.set({ blacklist }, () => {
                    console.log("Removed from blacklist:", message.url);
                    sendResponse({ success: true });
                });
            } else {
                sendResponse({ success: false });
            }
        });
    
        return true;
    }
});
