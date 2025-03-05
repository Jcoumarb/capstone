// Listen for message of end break sound
chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "endBreakMessage") playAudio(msg.play);
});

// Listen for message of start break sound
chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "startBreakMessage") playAudio(msg.play);
});

// Listen for message of coin sound
chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "coinMessage") playAudio(msg.play);
});

//listen for message of point loss sound
chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "pointLossMessage") playAudio(msg.play);
});

// Listen for messages of highscore sound
chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "highScoreMessage") playAudio(msg.play);
});

// Play sound with access to DOM APIs
function playAudio({ source, volume }) {
    const audio = new Audio(source);
    audio.volume = volume;
    audio.play();
}
