// Translation suggestions page: lists every i18n key of the TaigiKeyboard app,
// read live from the main branch. Each value's Fix button opens an inline editor;
// Confirm opens the repository's translation issue form with the title and suggested text filled.
(function () {
	'use strict';

	var REPO = 'taigikeyboard/taigikeyboard';
	var CONTENTS_API = 'https://api.github.com/repos/' + REPO + '/contents/';
	var ISSUE_URL = 'https://github.com/' + REPO + '/issues/new';
	var LANGUAGES = ['hanji', 'tailo', 'poj', 'en', 'ja'];
	// Each value is tagged with its own language, so Han glyphs and screen-reader
	// voices follow the text rather than the page.
	var LANGUAGE_TAGS = { hanji: 'nan-TW', tailo: 'nan-TW', poj: 'nan-TW', en: 'en', ja: 'ja' };
	// The unauthenticated contents API allows 60 calls an hour per IP; the raw file
	// fetches do not count. One listing per tab session keeps reloads and language
	// switches off that budget (two listings: i18n/ and i18n/content/).
	var LISTING_CACHE_PREFIX = 'translate-listing:';
	// Developer-facing text left out of the list: the web page's inspector panel, a testing aid.
	var HIDDEN_KEY = /^web\.inspector/;
	// Same limits tools/i18n/apply_suggestion.py enforces, checked here first so the
	// contributor hears about them before leaving the page.
	var MAX_LENGTH = 3000;
	var REJECTED_CHARACTER = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Cs}\p{Co}\p{Cn}]/u;
	// A longer URL is refused, since GitHub answers 414 past its server limit. About 890 Hanji fill it.
	var MAX_URL_LENGTH = 8000;

	var strings = JSON.parse(document.getElementById('translate-strings').textContent);
	var search = document.getElementById('translate-search');
	var namespaceSelect = document.getElementById('translate-namespace');
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

	// The .json files of one repository directory, each fetched raw (raw fetches are not rate-limited).
	function fetchJsonFiles(directory) {
		var cacheKey = LISTING_CACHE_PREFIX + directory;
		var cached = sessionStorage.getItem(cacheKey);
		var listing = cached ? Promise.resolve(JSON.parse(cached)) :
			fetchJson(CONTENTS_API + directory + '?ref=main').then(function (items) {
				sessionStorage.setItem(cacheKey, JSON.stringify(items));
				return items;
			});
		return listing.then(function (items) {
			var files = items.filter(function (item) { return item.type === 'file' && /\.json$/.test(item.name); });
			return Promise.all(files.map(function (item) {
				return fetchJson(item.download_url).then(function (doc) {
					return { name: item.name.replace(/\.json$/, ''), doc: doc };
				});
			}));
		});
	}

	// The title names the text (tools/i18n/apply_suggestion.py parses it); `suggestion` is the
	// form's one prefilled field (.github/ISSUE_TEMPLATE/translation.yml).
	function issueUrl(id, language, suggestion) {
		var params = new URLSearchParams({
			template: 'translation.yml',
			title: '[i18n] ' + id + ' (' + language + ')',
			suggestion: suggestion
		});
		var url = ISSUE_URL + '?' + params.toString();
		return url.length <= MAX_URL_LENGTH ? url : '';
	}

	// Returns the reason the new text cannot be sent, or '' when it can.
	function problemWith(text, current) {
		if (!text) return strings.error_empty;
		if (text === current) return strings.error_same;
		// Code points, as Python counts: an Extension B Hanji like 𪜶 is one character.
		if (Array.from(text).length > MAX_LENGTH) return strings.error_long;
		var rejected = text.replace(/\n/g, '').match(REJECTED_CHARACTER);
		if (rejected) {
			var code = rejected[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
			return strings.error_character + ' (U+' + code + ')';
		}
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
		problem.id = 'translate-problem-' + entry.id.replace(/\./g, '-') + '-' + language;
		problem.setAttribute('role', 'alert');
		input.setAttribute('aria-describedby', problem.id);
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

		function report(reason) {
			// Cleared first, so the alert is read again when the same reason repeats.
			problem.textContent = '';
			input.setAttribute('aria-invalid', 'true');
			requestAnimationFrame(function () { problem.textContent = reason; });
			input.focus();
		}

		function send() {
			var text = input.value.trim();
			var reason = problemWith(text, current);
			var url = reason ? '' : issueUrl(entry.id, language, text);
			if (!reason && !url) reason = strings.error_url;
			if (reason) {
				report(reason);
				return;
			}
			var tab = window.open(url, '_blank');
			if (tab) {
				tab.opener = null;
			} else {
				// Blocked (some in-app browsers): go there in this tab; the text rides in the URL.
				window.location.href = url;
				return;
			}
			close();
		}

		cancel.addEventListener('click', close);
		confirm.addEventListener('click', send);
		input.addEventListener('input', function () {
			problem.textContent = '';
			input.removeAttribute('aria-invalid');
		});
		editor.addEventListener('keydown', function (event) {
			// An input method's own Escape / Enter (cancel or commit a composition) is not ours.
			if (event.isComposing || event.keyCode === 229) return;
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
		status.textContent = shown ? '' : strings.empty;
		status.hidden = shown > 0;
	}

	function makeEntry(id, namespace, comment, values) {
		var entry = { id: id, namespace: namespace, comment: comment, values: values };
		entry.haystack = fold([id, comment].concat(LANGUAGES.map(function (l) {
			return values[l] || '';
		})).join('\n'));
		return entry;
	}

	// i18n/<namespace>.json: { namespace, keys: { key: { comment, values } } }.
	function namespaceEntries(doc) {
		return Object.keys(doc.keys).filter(function (key) {
			return !HIDDEN_KEY.test(doc.namespace + '.' + key);
		}).map(function (key) {
			var spec = doc.keys[key];
			return makeEntry(doc.namespace + '.' + key, doc.namespace, spec.comment || '', spec.values || {});
		});
	}

	// i18n/content/<file>.json: a list of items with title / summary / paragraphs. Ids follow
	// content.<file>.<item id>.<field>, the grammar tools/i18n/apply_suggestion.py parses:
	// title, summary, paragraph<N> (1-based), paragraph<N>.attachment.
	function contentEntries(name, doc) {
		var namespace = 'content.' + name;
		var items = Object.keys(doc).map(function (k) { return doc[k]; }).filter(Array.isArray)[0] || [];
		var found = [];
		items.forEach(function (item) {
			var base = namespace + '.' + item.id + '.';
			if (item.title) found.push(makeEntry(base + 'title', namespace, '', item.title));
			if (item.summary) found.push(makeEntry(base + 'summary', namespace, '', item.summary));
			(item.paragraphs || []).forEach(function (paragraph, index) {
				var field = base + 'paragraph' + (index + 1);
				if (paragraph.text) found.push(makeEntry(field, namespace, '', paragraph.text));
				if (paragraph.attachment && paragraph.attachment.text) {
					found.push(makeEntry(field + '.attachment', namespace, '', paragraph.attachment.text));
				}
			});
		});
		return found;
	}

	function render(found) {
		var fragment = document.createDocumentFragment();
		var namespaces = [];
		found.forEach(function (entry) {
			entry.node = renderEntry(entry);
			fragment.appendChild(entry.node);
			entries.push(entry);
			if (namespaces.indexOf(entry.namespace) === -1) namespaces.push(entry.namespace);
		});
		list.appendChild(fragment);

		namespaces.sort().forEach(function (namespace) {
			namespaceSelect.appendChild(element('option', null, namespace)).value = namespace;
		});
		search.disabled = false;
		namespaceSelect.disabled = false;
		search.addEventListener('input', applyFilter);
		namespaceSelect.addEventListener('change', applyFilter);
		applyFilter();
	}

	Promise.all([fetchJsonFiles('i18n'), fetchJsonFiles('i18n/content')])
		.then(function (directories) {
			var found = [];
			directories[0].forEach(function (file) {
				if (file.doc.namespace && file.doc.keys) found = found.concat(namespaceEntries(file.doc));
			});
			directories[1].forEach(function (file) {
				found = found.concat(contentEntries(file.name, file.doc));
			});
			render(found);
		})
		.catch(function (error) {
			console.error(error);
			status.textContent = strings.error;
		});
})();
