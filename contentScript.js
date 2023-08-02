chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'userUrl') {
		const currentUrl = window.location.href;
		observer.observe(document.body, { childList: true, subtree: true });
	}
});

let observer = new MutationObserver((mutations) => {
	for (let mutation of mutations) {
		if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
			const element = document.querySelector('.honor');
			if (element) {
				observer.disconnect();
				getAndProcessUserData(window.location.href);
				break;
			}
		}
	}
});

async function getAndProcessUserData(url) {
	let user = url.split('/')[4];
	let data = await getUserData(user);

	if (data) {
		addScoresToPage(data);
	}
}

async function getUserData(user) {
	try {
		let response = await fetch(`https://www.codewars.com/api/v1/users/${user}`);
		let data = await response.json();
		return data;
	} catch (error) {
		console.error(error);
	}
}

function addScoresToPage(data) {
	observer.disconnect();
	const honorElements = document.querySelectorAll(
		'.honor:not([data-score-added])'
	);
	const nextRankElement = document.querySelector(
		'.honor-chart-center h5:not([data-score-added])'
	);

	honorElements.forEach((element) => {
		const languageElement = element.querySelector('b');
		const language = languageElement.textContent.replace(':', '').toLowerCase();

		let score;
		if (language === 'overall') {
			score = data.ranks.overall?.score;
		} else if (data.ranks.languages[language]) {
			score = data.ranks.languages[language].score;
		}

		if (score !== undefined) {
			const scoreText = document.createTextNode(` / ${score}`);
			element.appendChild(scoreText);
			element.setAttribute('data-score-added', 'true');
		}
	});

	if (nextRankElement) {
		getRemainingScore(data.ranks.overall.score, data.ranks.overall.rank);
	}

	observer.observe(document.body, { childList: true, subtree: true });
}

function getRemainingScore(score, rank) {
	const rankScores = [0, 20, 76, 229, 643, 1768, 4829, 13147, 35759, 97225];
	const rankIndex = rank + 8;

	if (rankIndex < rankScores.length - 1) {
		const honorChartCenter = document.querySelector('.honor-chart-center h5');
		honorChartCenter.innerText +=
			' in ' + (rankScores[rankIndex + 1] - score) + ' points';
		honorChartCenter.setAttribute('data-score-added', 'true');
	}
}
