// Inclure jQuery en tant que fichier externe
var jqueryUrl = chrome.runtime.getURL('node_modules/jquery/dist/jquery.min.js');
var script = document.createElement('script');
script.setAttribute('src', jqueryUrl);
document.head.appendChild(script);

// Utiliser jQuery dans votre code
$(document).ready(function () {
	$(document).on('click', '#btn', function () {
		console.log('close');
	});
});
