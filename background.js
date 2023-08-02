import {
	verifKataUrl,
	verifUserUrl,
	changeIcon,
	findKata,
} from './functions.js';

let cwPage = false;
let kataId = '';
let previousUrl = null;

function handleUrlChange(currentUrl) {
	if (currentUrl !== previousUrl) {
		previousUrl = currentUrl;
		if (verifKataUrl(currentUrl)) {
			cwPage = true;
			kataId = findKata(currentUrl);
		} else {
			cwPage = false;
			kataId = '';
		}
		changeIcon(cwPage);
	}
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		handleUrlChange(tab.url);
		if (verifUserUrl(tab.url)) {
			chrome.tabs.sendMessage(tabId, { type: 'userUrl' });
		}
	}
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		handleUrlChange(tab.url);
	});
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type === 'pageCw') {
		sendResponse({ cwPage: cwPage, kataId: kataId });
	}
});
