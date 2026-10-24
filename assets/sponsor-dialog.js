// Enhances the payment disclosure with an accessible native modal.
(function () {
	'use strict';

	var chooser = document.querySelector('.sponsor-chooser');
	if (!chooser || typeof HTMLDialogElement === 'undefined' ||
		typeof HTMLDialogElement.prototype.showModal !== 'function') return;

	var summary = chooser.querySelector('summary');
	var panel = chooser.querySelector('.sponsor-panel');
	var closeButton = panel.querySelector('.sponsor-close');
	var trigger = document.createElement('button');
	trigger.type = 'button';
	trigger.className = 'sponsor-button';
	trigger.innerHTML = summary.innerHTML;
	trigger.setAttribute('aria-haspopup', 'dialog');
	trigger.setAttribute('aria-controls', 'sponsor-dialog');

	var dialog = document.createElement('dialog');
	dialog.id = 'sponsor-dialog';
	dialog.className = 'sponsor-dialog';
	dialog.setAttribute('aria-labelledby', 'sponsor-dialog-title');
	dialog.appendChild(panel);
	document.body.appendChild(dialog);
	chooser.replaceWith(trigger);
	closeButton.hidden = false;
	closeButton.autofocus = true;

	trigger.addEventListener('click', function () {
		dialog.showModal();
		document.documentElement.classList.add('sponsor-modal-open');
	});
	closeButton.addEventListener('click', function () { dialog.close(); });
	dialog.addEventListener('close', function () {
		document.documentElement.classList.remove('sponsor-modal-open');
		trigger.focus({ preventScroll: true });
	});

	function outside(event) {
		var bounds = dialog.getBoundingClientRect();
		return event.clientX < bounds.left || event.clientX > bounds.right ||
			event.clientY < bounds.top || event.clientY > bounds.bottom;
	}
	var startedOutside = false;
	dialog.addEventListener('pointerdown', function (event) {
		startedOutside = event.target === dialog && outside(event);
	});
	dialog.addEventListener('pointerup', function (event) {
		if (startedOutside && event.target === dialog && outside(event)) dialog.close();
		startedOutside = false;
	});
	dialog.addEventListener('pointercancel', function () { startedOutside = false; });
})();
