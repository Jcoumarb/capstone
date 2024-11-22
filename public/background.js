chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isActive: false, counter: 0 }, () => {
        console.log('Initialized: Mode off, counter at 0.');
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'incrementCounter') {
        // Log the alarm trigger
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
                    });
                } else {
                    console.log(`System idle (${state}), skipping increment.`);
                }
            });
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleMode') {
        chrome.storage.local.get('isActive', (data) => {
            const newMode = !data.isActive;
            chrome.storage.local.set({ isActive: newMode }, () => {
                console.log(`Mode changed: ${newMode ? 'Active' : 'Inactive'}`);
                if (newMode) {
                    chrome.alarms.create('incrementCounter', { periodInMinutes:  0.1});
                } else {
                    chrome.alarms.clear('incrementCounter');
                }
                sendResponse({ success: true, mode: newMode });
            });
        });
        return true; // Required for async response
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'resetCounter') {
        chrome.storage.local.set({ counter: 0 }, () => {
            console.log('Counter reset to zero.');
            sendResponse({ success: true });
        });
        return true; // Required for async response
    }
});
