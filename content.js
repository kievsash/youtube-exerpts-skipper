
// Function to get video ID from URL
function getVideoId() {
  const url = window.location.href;
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('v');
}

// Check for video progress
setInterval(() => {
  const videoId = getVideoId();

  if (!videoId) return;

  const video = document.querySelector('video');
  if (!video) return;

  chrome.storage.local.get(['timestamps'], (result) => {

    const video = document.querySelector('video');
    const timestamps = result.timestamps[videoId] || [];

    if (timestamps.length === 0) return; // nothing to skip

    const currentTime = Math.floor(video.currentTime);

    timestamps.forEach((timestamp) => {
      const secondsFrom = timestamp.minutesFrom * 60 + timestamp.secondsFrom;
      const secondsTo = timestamp.minutesTo * 60 + timestamp.secondsTo;
      if (currentTime >= secondsFrom && currentTime < secondsTo) {
        video.currentTime = secondsTo;
      }
    })

  });
}, 1500);

