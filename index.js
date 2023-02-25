var jqueryUrl = chrome.runtime.getURL('node_modules/jquery/dist/jquery.min.js');
var script = document.createElement('script');
script.setAttribute('src', jqueryUrl);
document.head.appendChild(script);

function fetchCodewarsData(user) {
	return new Promise((resolve, reject) => {
		fetch(`https://www.codewars.com/api/v1/users/${user}`)
			.then((response) => response.json())
			.then((data) => {
				resolve(data);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
// 	var url = tabs[0].url;
// 	console.log('URL actuelle : ' + url);
// 	if (url.includes('codewars.com')) {
// 		console.log('URL valide');
// 		chrome.action.setIcon({ path: '/assets/images/cw.png' });
// 	} else {
// 		console.log('URL invalide');
// 		chrome.action.setIcon({ path: '/assets/images/cw-b.png' });
// 	}
// });

$(document).ready(function () {
	fetchCodewarsData('Birious').then((data) => {
		$('#name').html(data.name);
	});

	$('#btn').click(function () {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			var url = tabs[0].url;
			console.log('URL actuelle : ' + url);
		});
		if (chrome.storage.sync) {
			chrome.storage.sync.set({ input: input }, function () {
				console.log('1', input);
			});
		} else {
			chrome.storage.local.set({ input: input }, function () {
				console.log('2', input);
			});
		}
		var input = $('#input').val();
		chrome.storage.sync.get(['input'], function (result) {
			console.log('Pseudo stocké : ' + result.input);
		});
	});
});
