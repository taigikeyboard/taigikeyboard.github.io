// Collapses mobile navigation while retaining the same links on every screen.
(function () {
	'use strict';

	var navbar = document.querySelector('.navbar');
	if (!navbar) return;
	var trigger = navbar.querySelector('.navbar-toggle');
	var links = navbar.querySelector('.navbar-menu');
	var language = navbar.querySelector('.language-switcher');
	var mobile = window.matchMedia('(max-width: 768px)');

	function close() {
		trigger.setAttribute('aria-expanded', 'false');
		links.classList.remove('is-open');
	}

	function syncLayout() {
		close();
		if (mobile.matches) {
			trigger.after(links);
		} else {
			trigger.parentNode.insertBefore(links, language || trigger);
		}
	}

	trigger.hidden = false;
	navbar.classList.add('navbar-enhanced');
	syncLayout();
	trigger.addEventListener('click', function () {
		var open = trigger.getAttribute('aria-expanded') !== 'true';
		trigger.setAttribute('aria-expanded', String(open));
		links.classList.toggle('is-open', open);
		if (open && language) language.open = false;
	});
	links.addEventListener('click', function (event) {
		if (event.target.closest('a')) close();
	});
	navbar.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
			event.preventDefault();
			close();
			trigger.focus();
		}
	});
	document.addEventListener('click', function (event) {
		if (!navbar.contains(event.target)) close();
	});
	navbar.addEventListener('focusout', function (event) {
		if (!navbar.contains(event.relatedTarget)) close();
	});
	if (language) language.addEventListener('toggle', function () {
		if (language.open) close();
	});
	mobile.addEventListener('change', syncLayout);
})();
