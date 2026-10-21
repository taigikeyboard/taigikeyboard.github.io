// Dismisses the native language disclosure without changing link navigation.
(function () {
	'use strict';

	var switcher = document.querySelector('.language-switcher');
	if (!switcher) return;

	var trigger = switcher.querySelector('summary');

	document.addEventListener('click', function (event) {
		if (!switcher.contains(event.target)) switcher.open = false;
	});

	switcher.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && switcher.open) {
			event.preventDefault();
			switcher.open = false;
			trigger.focus();
		}
	});

	switcher.addEventListener('focusout', function (event) {
		if (!switcher.contains(event.relatedTarget)) switcher.open = false;
	});
})();
