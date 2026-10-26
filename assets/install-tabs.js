// Selects the visitor's platform and adds manual navigation to desktop installation guides.
(function () {
	'use strict';

	function detectPlatform() {
		var ua = navigator.userAgent;

		// iPadOS reports itself as a Mac, so check for the touch points that a
		// real Mac does not have before falling through to macOS.
		if (/iPhone|iPod/.test(ua)) return 'ios';
		if (/iPad/.test(ua)) return 'ios';
		if (/Macintosh/.test(ua)) {
			return navigator.maxTouchPoints > 1 ? 'ios' : 'macos';
		}
		if (/Android/.test(ua)) return 'android';
		if (/Windows/.test(ua)) return 'windows';
		return null;
	}

	var platform = detectPlatform();
	var input = document.getElementById('install-tab-' + platform);
	if (input) input.checked = true;

	document.querySelectorAll('[data-install-guide]').forEach(function (guide) {
		var steps = Array.from(guide.querySelectorAll('.install-step'));
		var controls = guide.querySelector('.install-controls');
		var previous = guide.querySelector('[data-install-previous]');
		var next = guide.querySelector('[data-install-next]');
		var progress = guide.querySelector('[data-install-progress]');
		var current = 0;

		function renderStep() {
			steps.forEach(function (step, index) {
				step.hidden = index !== current;
			});
			progress.textContent = (current + 1) + ' / ' + steps.length;
			previous.disabled = current === 0;
			next.disabled = current === steps.length - 1;
		}

		previous.addEventListener('click', function () {
			if (current > 0) current -= 1;
			renderStep();
		});
		next.addEventListener('click', function () {
			if (current < steps.length - 1) current += 1;
			renderStep();
		});
		guide.classList.add('install-guide-enhanced');
		renderStep();
		controls.hidden = false;
	});

	var printCommands = [];
	window.addEventListener('beforeprint', function () {
		printCommands = Array.from(document.querySelectorAll('.install-commands:not([open])'));
		printCommands.forEach(function (commands) { commands.open = true; });
	});
	window.addEventListener('afterprint', function () {
		printCommands.forEach(function (commands) { commands.open = false; });
		printCommands = [];
	});
})();
