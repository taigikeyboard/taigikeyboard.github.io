// Translation suggestions page: lists every i18n key of the TaigiKeyboard app,
// read live from the main branch. Each value's Fix button opens an inline editor;
// Confirm opens the repository's translation issue form with every field filled.
(function () {
	'use strict';

	var REPO = 'taigikeyboard/taigikeyboard';
	var LISTING_URL = 'https://api.github.com/repos/' + REPO + '/contents/i18n?ref=main';
	var ISSUE_URL = 'https://github.com/' + REPO + '/issues/new';
	var LANGUAGES = ['hanji', 'tailo', 'poj', 'en', 'ja'];
	// Each value is tagged with its own language, so Han glyphs and screen-reader
	// voices follow the text rather than the page.
	var LANGUAGE_TAGS = { hanji: 'nan-TW', tailo: 'nan-TW', poj: 'nan-TW', en: 'en', ja: 'ja' };
	// The unauthenticated contents API allows 60 calls an hour per IP; the raw file
	// fetches do not count. One listing per tab session keeps reloads and language
	// switches off that budget.
	var LISTING_CACHE_KEY = 'translate-i18n-listing';
	// Developer-facing text left out of the list: the web page's inspector panel, a testing aid.
	var HIDDEN_KEY = /^web\.inspector/;
	// Same limits tools/i18n/apply_suggestion.py enforces, checked here first so the
	// contributor hears about them before leaving the page.
	var MAX_LENGTH = 3000;
	var REJECTED_CHARACTER = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Cs}\p{Co}\p{Cn}]/u;
	// Past this the current text is left out of the URL (the form's field is optional and
	// the automation reads the source file); GitHub answers 414 past its server limit.
	var MAX_URL_LENGTH = 8000;

	var strings = JSON.parse(document.getElementById('translate-strings').textContent);
	var search = document.getElementById('translate-search');
	var namespaceSelect = document.getElementById('translate-namespace');
	var count = document.getElementById('translate-count');
	var status = document.getElementById('translate-status');
	var list = document.getElementById('translate-list');
	var entries = [];

	// Case-, diacritic- and hyphen-insensitive, so "khi puann" finds "Khí-puânn".
	function fold(text) {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, ' ').toLowerCase();
	}

	function fetchJson(url) {
		return fetch(url).then(function (response) {
			if (!response.ok) throw new Error(url + ' ' + response.status);
			return response.json();
		});
	}

	function fetchListing() {
		var cached = sessionStorage.getItem(LISTING_CACHE_KEY);
		if (cached) return Promise.resolve(JSON.parse(cached));
		return fetchJson(LISTING_URL).then(function (listing) {
			sessionStorage.setItem(LISTING_CACHE_KEY, JSON.stringify(listing));
			return listing;
		});
	}

	// Field ids of .github/ISSUE_TEMPLATE/translation.yml: key, language, current, suggestion.
	function issueUrl(id, language, current, suggestion) {
		var params = new URLSearchParams({
			template: 'translation.yml',
			title: '[i18n] ' + id + ' (' + language + ')',
			key: id,
			language: language,
			current: current,
			suggestion: suggestion
		});
		var url = ISSUE_URL + '?' + params.toString();
		if (url.length <= MAX_URL_LENGTH) return url;
		params.delete('current');
		return ISSUE_URL + '?' + params.toString();
	}

	// Returns the reason the new text cannot be sent, or '' when it can.
	function problemWith(text, current) {
		if (!text) return strings.error_empty;
		if (text === current) return strings.error_same;
		if (text.length > MAX_LENGTH) return strings.error_long;
		if (REJECTED_CHARACTER.test(text.replace(/\n/g, ''))) return strings.error_character;
		return '';
	}

	function element(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text !== undefined) node.textContent = text;
		return node;
	}

	function openEditor(cell, button, entry, language) {
		if (cell.nextSibling && cell.nextSibling.classList.contains('translate-editor')) {
			cell.nextSibling.querySelector('textarea').focus();
			return;
		}
		var current = entry.values[language] || '';
		var editor = element('dd', 'translate-editor');
		var input = element('textarea');
		input.value = current;
		input.lang = LANGUAGE_TAGS[language];
		input.rows = Math.min(8, current.split('\n').length + 1);
		input.setAttribute('aria-label', strings.suggest + ' ' + entry.id + ' ' + strings.languages[language]);
		var problem = element('p', 'translate-problem');
		problem.setAttribute('role', 'alert');
		var actions = element('div', 'translate-actions');
		var cancel = element('button', 'translate-cancel', strings.cancel);
		cancel.type = 'button';
		var confirm = element('button', 'translate-confirm', strings.confirm);
		confirm.type = 'button';
		actions.appendChild(cancel);
		actions.appendChild(confirm);
		editor.appendChild(input);
		editor.appendChild(problem);
		editor.appendChild(actions);
		cell.after(editor);
		button.setAttribute('aria-expanded', 'true');

		function close() {
			editor.remove();
			button.setAttribute('aria-expanded', 'false');
			button.focus();
		}

		function send() {
			var text = input.value.replace(/\r\n?/g, '\n').trim();
			var reason = problemWith(text, current);
			problem.textContent = reason;
			if (reason) {
				input.focus();
				return;
			}
			window.open(issueUrl(entry.id, language, current, text), '_blank', 'noopener');
			close();
		}

		cancel.addEventListener('click', close);
		confirm.addEventListener('click', send);
		input.addEventListener('input', function () { problem.textContent = ''; });
		input.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
			} else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				send();
			}
		});
		input.focus();
		input.setSelectionRange(input.value.length, input.value.length);
	}

	function renderEntry(entry) {
		var card = element('article', 'translate-entry');
		card.appendChild(element('code', 'translate-key', entry.id));
		if (entry.comment) {
			var note = element('p', 'translate-note');
			note.appendChild(element('span', 'translate-note-label', strings.note));
			note.appendChild(document.createTextNode(entry.comment));
			card.appendChild(note);
		}
		var rows = element('dl', 'translate-values');
		LANGUAGES.forEach(function (language) {
			var value = entry.values[language] || '';
			rows.appendChild(element('dt', null, strings.languages[language]));
			var cell = element('dd');
			var text = element('span', 'translate-value', value);
			text.lang = LANGUAGE_TAGS[language];
			cell.appendChild(text);
			var button = element('button', 'translate-suggest', strings.suggest);
			button.type = 'button';
			button.setAttribute('aria-expanded', 'false');
			button.setAttribute('aria-label', strings.suggest + ' ' + entry.id + ' ' + strings.languages[language]);
			button.addEventListener('click', function () { openEditor(cell, button, entry, language); });
			cell.appendChild(button);
			rows.appendChild(cell);
		});
		card.appendChild(rows);
		return card;
	}

	function applyFilter() {
		var query = fold(search.value.trim());
		var namespace = namespaceSelect.value;
		var shown = 0;
		entries.forEach(function (entry) {
			var visible = (!namespace || entry.namespace === namespace) &&
				(!query || entry.haystack.indexOf(query) !== -1);
			entry.node.hidden = !visible;
			if (visible) shown += 1;
		});
		count.textContent = strings.count.replace('{n}', shown);
		status.textContent = shown ? '' : strings.empty;
		status.hidden = shown > 0;
	}

	function render(documents) {
		documents.forEach(function (doc) {
			Object.keys(doc.keys).filter(function (key) {
				return !HIDDEN_KEY.test(doc.namespace + '.' + key);
			}).forEach(function (key) {
				var spec = doc.keys[key];
				var values = spec.values || {};
				var entry = {
					id: doc.namespace + '.' + key,
					namespace: doc.namespace,
					comment: spec.comment || '',
					values: values
				};
				entry.haystack = fold([entry.id, entry.comment].concat(LANGUAGES.map(function (l) {
					return values[l] || '';
				})).join('\n'));
				entry.node = renderEntry(entry);
				entries.push(entry);
			});
		});
		var fragment = document.createDocumentFragment();
		entries.forEach(function (entry) { fragment.appendChild(entry.node); });
		list.appendChild(fragment);

		documents.map(function (doc) { return doc.namespace; }).sort().forEach(function (namespace) {
			namespaceSelect.appendChild(element('option', null, namespace)).value = namespace;
		});
		search.disabled = false;
		namespaceSelect.disabled = false;
		search.addEventListener('input', applyFilter);
		namespaceSelect.addEventListener('change', applyFilter);
		applyFilter();
	}

	fetchListing()
		.then(function (listing) {
			// Namespace files only: i18n/content/ holds long-form guide text in another shape.
			var files = listing.filter(function (item) {
				return item.type === 'file' && /\.json$/.test(item.name);
			});
			return Promise.all(files.map(function (item) { return fetchJson(item.download_url); }));
		})
		.then(function (documents) {
			render(documents.filter(function (doc) { return doc.namespace && doc.keys; }));
		})
		.catch(function (error) {
			console.error(error);
			status.textContent = strings.error;
		});
})();
