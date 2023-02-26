import {
	compare,
	objectTitle,
	capitalizeFirstLetter,
	points,
	thousandSeparator,
} from './functions.js';
var jqueryUrl = chrome.runtime.getURL('node_modules/jquery/dist/jquery.min.js');
var script = document.createElement('script');
script.setAttribute('src', jqueryUrl);
document.head.appendChild(script);

function fetchCodewarsData(user, infos) {
	return fetch(`https://www.codewars.com/api/v1/users/${user}`)
		.then((response) => {
			if (!response.ok) {
				clearData();
				throw new Error('Invalid response from server');
			}
			return response.json();
		})
		.then((data) => {
			if (infos) {
				if (JSON.stringify(infos) !== JSON.stringify(data)) {
					saveAndDisplayData(data);
				}
			} else {
				saveAndDisplayData(data);
			}
		})
		.catch((error) => {
			console.error(error);
		});
}

function displayData(data) {
	$('#name').html(data.username);
	$('#honor').html(`Score total : ${data.honor} ${points(data.honor)}`);
	$('#katas').html(`Katas réussi: ${data.codeChallenges.totalCompleted}`);
	$('#rank').html(`Rang : ${data.ranks.overall.name}`);
	if (data.leaderboardPosition === null) {
		$('#leaderboardPosition').html('Leaderboard : Non disponible');
	} else {
		$('#leaderboardPosition').html(
			`Leaderboard : ${thousandSeparator(data.leaderboardPosition)} ème`
		);
	}
	const languagesData = objectTitle(data).sort(compare);
	$('#languages').empty();
	languagesData.forEach((element) => {
		$('#languages').append(
			`<li> - ${capitalizeFirstLetter(element[0])} : ${
				element[1].score
			} ${points(element[1].score)}</li>`
		);
	});
	$('#error').empty();
	$('#inputPseudo').css('margin-bottom', '0');
}

function clearData() {
	$('#name').empty();
	$('#honor').empty();
	$('#katas').empty();
	$('#rank').empty();
	$('#leaderboardPosition').empty();
	$('#languages').empty();
	$('#error').html('Utilisateur non trouvé');
	$('#inputPseudo').css('margin-bottom', '1rem');
}

function saveAndDisplayData(data) {
	chrome.storage.sync.set({ codewarsData: data }, function () {
		displayData(data);
	});
}

$(document).ready(function () {
	chrome.storage.sync.clear();
	chrome.storage.sync.get(['codewarsData'], function (result) {
		console.log(result);
		if (result.codewarsData) {
			displayData(result.codewarsData);
			fetchCodewarsData(result.codewarsData.username, result.codewarsData);
		}
	});

	$('#btn').on('click', function () {
		chrome.runtime.sendMessage({ type: 'hello' }, function (response) {
			console.log(response);
		});
		// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		// 	var url = tabs[0].url;
		// 	console.log('URL actuelle : ' + url);
		// });
		// var input = $('#input').val();
		// if (chrome.storage.sync) {
		// 	chrome.storage.sync.set({ input: input }, function () {
		// 		console.log('1', input);
		// 	});
		// } else {
		// 	chrome.storage.local.set({ input: input }, function () {
		// 		console.log('2', input);
		// 	});
		// }
		// chrome.storage.sync.get(['input'], function (result) {
		// 	console.log('Pseudo stocké : ' + result.input);
		// });
	});

	$('#inputPseudo').on('keyup', function (event) {
		if (event.key === 'Enter') {
			let inputValue = $(this).val();
			fetchCodewarsData(inputValue);
			$(this).val('');
		}
	});
});
