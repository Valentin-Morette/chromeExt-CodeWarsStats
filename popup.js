import {
	compare,
	objectTitle,
	capitalizeFirstLetter,
	points,
	thousandSeparator,
	formatDate,
	loadTranslations,
	getTranslation,
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
	$('#honor').html(
		`${getTranslation('honor')} : ${data.honor} ${points(data.honor)}`
	);
	$('#score').html(
		`${getTranslation('totalScore')} : ${data.ranks.overall.score} ${points(
			data.ranks.overall.score
		)}`
	);
	$('#katas').html(
		`${getTranslation('succeededKata')} : ${data.codeChallenges.totalCompleted}`
	);
	$('#rank').html(`${getTranslation('rank')} : ${data.ranks.overall.name}`);
	if (data.leaderboardPosition === null) {
		$('#leaderboardPosition').html(
			`${getTranslation('leaderboard')} : ${getTranslation('unknownUser')}`
		);
	} else {
		$('#leaderboardPosition').html(
			`${getTranslation('leaderboard')} : ${thousandSeparator(
				data.leaderboardPosition
			)}${getTranslation(
				data.leaderboardPosition === 1 ? 'ordinalFirst' : 'ordinalOther'
			)}`
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
	$('#score').empty();
	$('#katas').empty();
	$('#rank').empty();
	$('#leaderboardPosition').empty();
	$('#languages').empty();
	$('#error').html(`${getTranslation('foundUser')}`);
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

	loadTranslations().then(() => {
		$('#nickname').html(getTranslation('nickname'));
		$('#inputPseudo').attr('placeholder', getTranslation('inputPlaceholder'));

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
						$('#challengeRank').html(
							`${getTranslation('rank')} : ${data.rank.name}`
						);
						$('#challengeCategory').html(
							`${getTranslation('category')} : ${data.category}`
						);
						$('#challengeCreator').html(
							`${getTranslation('creator')} : ${data.createdBy.username}`
						);
						$('#challengeCreatedAt').html(
							`${getTranslation('createdAt')} : ${formatDate(data.createdAt)}`
						);
						$('#challengeTotalAttempts').html(
							`${getTranslation('attempts')} : ${thousandSeparator(
								data.totalAttempts
							)}`
						);
						$('#challengeTotalCompleted').html(
							`${getTranslation('completed')} : ${thousandSeparator(
								data.totalCompleted
							)}`
						);
						$('#challengePercentCompleted').html(
							`${getTranslation('percentCompleted')} : ${(
								(data.totalCompleted / data.totalAttempts) *
								100
							).toFixed(2)}%`
						);
					})
					.catch((error) => {
						console.error(error);
					});
			}
		});

		chrome.storage.sync.get(['codewarsData'], function (result) {
			if (result.codewarsData) {
				displayData(result.codewarsData);
				fetchCodewarsData(result.codewarsData.username, result.codewarsData);
			}
		});

		$('#inputPseudo').on('keyup', function (event) {
			if (event.key === 'Enter') {
				let inputValue = $(this).val();
				fetchCodewarsData(inputValue);
				$(this).val('');
			}
		});
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
