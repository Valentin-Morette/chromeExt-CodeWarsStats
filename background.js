import { changeIcon } from './functions.js';

let cwPage = false;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	cwPage = changeIcon(tab);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		cwPage = changeIcon(tab);
	});
});

var myVariable = 'hello world';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type === 'hello') {
		sendResponse({ myVariable: cwPage });
	}
});
