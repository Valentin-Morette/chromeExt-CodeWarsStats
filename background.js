function changeIcon(tab) {
	if (tab.url) {
		if (tab.url.includes('codewars.com')) {
			chrome.action.setIcon({ path: '/assets/images/cw.png' });
		} else {
			chrome.action.setIcon({ path: '/assets/images/cw-b.png' });
		}
	}
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	changeIcon(tab);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		changeIcon(tab);
		chrome.storage.sync.get(['input'], function (result) {
			console.log('Pseudo stocké : ' + result.input);
		});
	});
});
