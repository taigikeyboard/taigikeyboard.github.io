// Translation suggestions page: lists every i18n key of the TaigiKeyboard app,
// read live from the main branch, with a Suggest link per language that opens
// the repository's translation issue form prefilled.
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

	// The current text rides in the URL. The longest today is about 4,200
	// characters; GitHub answers 414 past its server limit.
	function suggestUrl(id, language, current) {
		var params = new URLSearchParams({
			template: 'translation.yml',
			title: '[i18n] ' + id + ' (' + language + ')',
			key: id,
			language: language,
			current: current
		});
		return ISSUE_URL + '?' + params.toString();
	}

	function element(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text !== undefined) node.textContent = text;
		return node;
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
			var link = element('a', 'translate-suggest', strings.suggest);
			link.href = suggestUrl(entry.id, language, value);
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
			link.setAttribute('aria-label', strings.suggest + ' ' + entry.id + ' ' + strings.languages[language]);
			cell.appendChild(link);
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
