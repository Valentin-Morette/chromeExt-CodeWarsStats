import { verifUrl, changeIcon, findKata } from './functions.js';

let cwPage = false;
let kataId = '';
let previousUrl = null;

function fullCtrl(tab) {
	cwPage = verifUrl(tab);
	changeIcon(cwPage);
	kataId = cwPage ? findKata(tab.url) : '';
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		const currentUrl = tab.url;
		if (currentUrl !== previousUrl) {
			previousUrl = currentUrl;
			fullCtrl(tab);
		}
	}
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		fullCtrl(tab);
	});
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type === 'pageCw') {
		sendResponse({ cwPage: cwPage, kataId: kataId });
	}
});
