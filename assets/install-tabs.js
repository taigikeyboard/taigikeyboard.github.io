/**
 * Pre-selects the install tab matching the visitor's own system, so someone on
 * an iPhone lands on the iPhone steps instead of whatever tab happens to be
 * first. Switching itself is pure CSS (see .install-tablist in _landing.scss) —
 * this only moves the initial choice, and does nothing if the visitor's system
 * has no tab on the page.
 */
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
	if (!platform) return;

	var input = document.getElementById('install-tab-' + platform);
	if (input) input.checked = true;
})();
