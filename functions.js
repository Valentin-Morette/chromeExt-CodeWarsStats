function verifUrl(tab) {
	if (!tab.url) return false;
	const isKataUrl = /^https:\/\/www.codewars.com\/kata\/\w+/.test(tab.url);
	return isKataUrl;
}

function changeIcon(validUrl) {
	const iconPath = validUrl
		? '/assets/images/cw.png'
		: '/assets/images/cw-b.png';
	chrome.action.setIcon({ path: iconPath });
}

function findKata(url) {
	const kataId = url.split('/');
	return kataId[4];
}

function compare(a, b) {
	if (a[1].score < b[1].score) return 1;
	if (a[1].score > b[1].score) return -1;
	return 0;
}

function formatDate(dateString) {
	const date = new Date(dateString);
	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear().toString();
	return `${day}/${month}/${year}`;
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
	verifUrl,
	changeIcon,
	findKata,
	compare,
	objectTitle,
	capitalizeFirstLetter,
	points,
	thousandSeparator,
	formatDate,
};
