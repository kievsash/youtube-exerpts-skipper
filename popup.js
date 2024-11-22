document.addEventListener('DOMContentLoaded', () => {
    function getVideoId() {
        const urlParams = new URLSearchParams(new URL(activeTabUrl).search);
        return urlParams.get('v');
    }

    const minutesFromInput = document.getElementById('minutesFrom');
    const secondsFromInput = document.getElementById('secondsFrom');
    const minutesToInput = document.getElementById('minutesTo');
    const secondsToInput = document.getElementById('secondsTo');
    const addButton = document.getElementById('addTimestamp');
    const timestampsList = document.getElementById('timestamps');
    const timestampsDiv = document.querySelector('.timestamp-input');
    let activeTabUrl = '';


    // Get a tab url to grab youtube videoId
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        activeTabUrl = activeTab.url;

        if (!getVideoId()) {
            timestampsDiv.innerHTML = 'No YouTube Video Id. Go to specific video page.';
        }
    });

    // Load saved timestamps
    chrome.storage.local.get(['timestamps'], (result) => {
        const timestamps = result.timestamps || {};
        renderTimestamps(timestamps);
    });

    addButton.addEventListener('click', () => {

        const minutesFrom = parseInt(minutesFromInput.value) || 0;
        const secondsFrom = parseInt(secondsFromInput.value) || 0;
        const minutesTo = parseInt(minutesToInput.value) || 0;
        const secondsTo = parseInt(secondsToInput.value) || 0;

        const totalSeconds = (minutesTo * 60 + secondsTo) - (minutesFrom * 60 + secondsFrom);


        chrome.storage.local.get(['timestamps'], (result) => {
            const timestamps = result.timestamps || {};
            const videoId = getVideoId();
            timestamps[videoId] = timestamps[videoId] || [];

            timestamps[videoId].push({
                minutesFrom,
                secondsFrom,
                minutesTo,
                secondsTo,
                totalSeconds,
            });
            timestamps[videoId].sort((a, b) => (a.minutesFrom * 60 + b.secondsFrom) - (b.minutesFrom * 60 - b.secondsFrom));

            chrome.storage.local.set({ timestamps }, () => {
                renderTimestamps(timestamps);

                minutesFromInput.value = '';
                secondsFromInput.value = '';
                minutesToInput.value = '';
                secondsToInput.value = '';
            });

        });
    });

    function twoSymView(n) {
        return ('0'+n).slice(-2)
    }

    function renderTimestamps(timestamps) {
        const videoId = getVideoId();

        timestamps[videoId] = timestamps[videoId] || [];
        timestampsList.innerHTML = '';

        if (!videoId) {
            timestampsDiv.innerHTML = 'No YouTube Video Id. Go to specific video page.'
            return;
        }

        if (videoId) {

            timestamps[videoId].forEach(({
                                             minutesFrom,
                                             secondsFrom,
                                             minutesTo,
                                             secondsTo,
                                             totalSeconds,
                                         }, index) => {
                const div = document.createElement('div');
                div.className = 'timestamp-item';
                const timeString = `${twoSymView(minutesFrom)}:${twoSymView(secondsFrom)} - ${twoSymView(minutesTo)}:${twoSymView(secondsTo)}`;

                div.innerHTML = `
                <span>${timeString}</span>
                <button class="delete" data-index="${index}">Delete</button>
              `;

                timestampsList.appendChild(div);
            });
        }

        // Add delete handlers
        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const videoId = getVideoId();
                const index = parseInt(e.target.dataset.index);
                chrome.storage.local.get(['timestamps'], (result) => {
                    const timestamps = result.timestamps || {};
                    const videoTimestamp = timestamps[videoId] || [];
                    videoTimestamp.splice(index, 1);
                    chrome.storage.local.set({ timestamps }, () => {
                        renderTimestamps(timestamps);
                    });
                });
            });
        });
    }
});
