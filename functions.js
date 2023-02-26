function changeIcon(tab) {
	if (tab.url) {
		if (tab.url.includes('codewars.com')) {
			chrome.action.setIcon({ path: '/assets/images/cw.png' });
			return true;
		} else {
			chrome.action.setIcon({ path: '/assets/images/cw-b.png' });
			return false;
		}
	}
}

function compare(a, b) {
	if (a[1].score < b[1].score) return 1;
	if (a[1].score > b[1].score) return -1;
	return 0;
}

function objectTitle(data) {
	let arr = [];
	for (const [key, value] of Object.entries(data.ranks.languages)) {
		arr.push([key, value]);
	}
	return arr;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function points(score) {
	return score === 1 ? 'point' : 'points';
}

function thousandSeparator(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export {
	changeIcon,
	compare,
	objectTitle,
	capitalizeFirstLetter,
	points,
	thousandSeparator,
};
