import {
	compare,
	objectTitle,
	capitalizeFirstLetter,
	points,
	thousandSeparator,
	formatDate,
} from './functions.js';
var jqueryUrl = chrome.runtime.getURL('node_modules/jquery/dist/jquery.min.js');
var script = document.createElement('script');
script.setAttribute('src', jqueryUrl);
document.head.appendChild(script);

function fetchCodewarsData(user, infos) {
	return fetch(`https://www.codewars.com/api/v1/users/${user}`)
		.then((response) => {
			if (!response.ok) {
				chrome.storage.sync.set({ codewarsData: '' }, function () {
					clearData();
				});
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
		$('#leaderboardPosition').html('Leaderboard : Inconnu');
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

function swap() {
	if ($('#kataCheck').is(':checked')) {
		$('#cwstatsAll').hide();
		$('#challengeInfos').show();
		$('#inputPseudo').hide();
		$('#error').empty();
		$('#infos').css('margin-bottom', '0');
	} else if ($('#pseudoCheck').is(':checked')) {
		$('#cwstatsAll').show();
		$('#challengeInfos').hide();
		$('#inputPseudo').show();
		$('#infos').css('margin-bottom', '1rem');
	}
}

$(document).ready(function () {
	let kataId = '';

	swap();

	chrome.runtime.sendMessage({ type: 'pageCw' }, function (response) {
		if (!response.cwPage) {
			$('.selector').hide();
		}
		kataId = response.kataId;
		if (kataId !== '') {
			fetch(`https://www.codewars.com/api/v1/code-challenges/${kataId}`)
				.then((response) => {
					if (!response.ok) {
						throw new Error('Invalid response from server');
					}
					return response.json();
				})
				.then((data) => {
					console.log(data);
					$('#challengeRank').html(`Rang : ${data.rank.name}`);
					$('#challengeCategory').html(`Catégorie : ${data.category}`);
					$('#challengeCreator').html(`Créateur : ${data.createdBy.username}`);
					$('#challengeCreatedAt').html(
						`Créé le : ${formatDate(data.createdAt)}`
					);
					$('#challengeTotalAttempts').html(
						`Tentatives : ${thousandSeparator(data.totalAttempts)}`
					);
					$('#challengeTotalCompleted').html(
						`Complétés : ${thousandSeparator(data.totalCompleted)}`
					);
					$('#challengePercentCompleted').html(
						`Taux complétion : ${(
							(data.totalCompleted / data.totalAttempts) *
							100
						).toFixed(2)}%`
					);
				})
				.catch((error) => {
					console.error(error);
				});
		} else {
			console.log('kataId vide');
		}
	});

	chrome.storage.sync.get(['codewarsData'], function (result) {
		if (result.codewarsData) {
			displayData(result.codewarsData);
			fetchCodewarsData(result.codewarsData.username, result.codewarsData);
		}
	});

	$('#btn').on('click', function () {
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

	$('input[type="checkbox"]').on('change', function () {
		if ($(this).is(':checked')) {
			$('input[type="checkbox"]').not(this).prop('checked', false);
		}
		if ($('input[type="checkbox"]:checked').length === 0) {
			$(this).prop('checked', true);
		}
		swap();
	});
});
