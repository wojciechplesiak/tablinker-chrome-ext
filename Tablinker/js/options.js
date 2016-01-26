/**
  * Tablinker Chrome Extension
  * Options JS
  * @date 14/01/2016
  * @author Wojciech Plesiak 
  * @email plesiak.wojciech+tablinker@gmail.com
  */

var MIN_EXTRA_LINES     = 0;
var STATUS_DURATION     = 2000;

var ID_OPTIONS_DESC     = 'options_description';
var ID_BTN_SAVE    	    = 'btn_save';
var ID_BTN_RESTORE      = 'btn_restore';
var ID_BTN_MORE         = 'btn_more';
var ID_BTN_HELP         = 'btn_help';
var ID_BTN_BACK      	= 'btn_back';

var ID_HELP_TITLE      	= 'help_title';
var ID_HELP_TITLE_EXP 	= 'help_title_explanation';
var ID_HELP_URL      	= 'help_url';
var ID_HELP_URL_EXP    	= 'help_url_explanation';
var ID_HELP_URL_EXP_1  	= 'help_url_explanation_1';
var ID_HELP_URL_EXP_2  	= 'help_url_explanation_2';
var ID_HELP_FOOTER  	= 'help_github_footer';
var ID_HELP_GITHUB  	= 'help_github_line';
var ID_MULTIENTRY_CB  	= 'multientry_checkbox';

var DIV_MAIN	 		= 'mainDiv';
var DIV_HELP 			= 'helpDiv';

var ELEMENT_TITLE       = 'title';
var ELEMENT_URL         = 'url';
var ELEMENT_CONTAINER   = 'container';
var ELEMENT_DELETE_BTN  = 'delete';
var ELEMENT_DIV         = 'div';
var ELEMENT_CHECKBOX	= 'multientry_cb';

var EMPTY               = ''
var HASH				= '#'
var TITLE_PLACEHOLDER   = 'title_placeholder'
var BASEURL_PLACEHOLDER = 'base_url_placeholder'

var CSS_CLASS_WARNING	= 'warning';
var CSS_CLASS_ERROR		= 'error';

var PLACEHOLDER         = '%d';

var NEXT_LINE_HTML = '<div id="div%d" class="optionsRow nextRow"><input type="text" id="title%d" placeholder="' + getTitlePlaceholder() + '"></input><div style="float:right; margin-top:5px;"><div class="noInputBorder"><input id="%d" type="image" src="assets/clear.png" alt="Remove" width="14" height="14" class="deleteButton"/></div></div><input type="text" id="url%d" placeholder="' + getBaseUrlPlaceholder() + '" style="min-width:100%;" autofocus><br></div>';

var validate			= false;

/**
  * Restores select box and checkbox state using the preferences stored in chrome.storage.
  * Should be called when document is loaded.
  */
function on_load() {
	localize_page();
	chrome.storage.sync.get({
		_title: EMPTY,
		_url: EMPTY,
		_extraLines: MIN_EXTRA_LINES,
		_titles: [],
		_urls: [],
		_multientry: true
	}, function(_items) {
		on_restore(_items);
	});
}

function localize_page() {
	document.getElementById(ID_OPTIONS_DESC).textContent = chrome.i18n.getMessage(ID_OPTIONS_DESC);
	document.getElementById(ID_BTN_SAVE).textContent = chrome.i18n.getMessage(ID_BTN_SAVE);
	document.getElementById(ID_BTN_RESTORE).textContent = chrome.i18n.getMessage(ID_BTN_RESTORE);
	document.getElementById(ID_MULTIENTRY_CB).textContent = chrome.i18n.getMessage(ID_MULTIENTRY_CB);
	document.getElementById(ELEMENT_TITLE).placeholder = getTitlePlaceholder();
	document.getElementById(ELEMENT_URL).placeholder = getBaseUrlPlaceholder();
	
	// help page
	document.getElementById(ID_HELP_TITLE).textContent = chrome.i18n.getMessage(ID_HELP_TITLE);
	document.getElementById(ID_HELP_TITLE_EXP).textContent = chrome.i18n.getMessage(ID_HELP_TITLE_EXP);
	document.getElementById(ID_HELP_URL).textContent = chrome.i18n.getMessage(ID_HELP_URL);
	document.getElementById(ID_HELP_URL_EXP).textContent = chrome.i18n.getMessage(ID_HELP_URL_EXP);
	document.getElementById(ID_HELP_URL_EXP_1).textContent = chrome.i18n.getMessage(ID_HELP_URL_EXP_1);
	document.getElementById(ID_HELP_URL_EXP_2).textContent = chrome.i18n.getMessage(ID_HELP_URL_EXP_2);
	document.getElementById(ID_HELP_FOOTER).textContent = chrome.i18n.getMessage(ID_HELP_FOOTER);
	document.getElementById(ID_HELP_GITHUB).textContent = chrome.i18n.getMessage(ID_HELP_GITHUB);
}

function getTitlePlaceholder() {
	return chrome.i18n.getMessage(TITLE_PLACEHOLDER);
}

function getBaseUrlPlaceholder() {
	return chrome.i18n.getMessage(BASEURL_PLACEHOLDER);
}

function on_restore(_items) {
	reset_elements();
	// restore UI elements with saved values
	document.getElementById(ELEMENT_TITLE).value = _items._title;
	setup_entry_with_validation(ELEMENT_URL, _items._url);

	if (_items._extraLines > MIN_EXTRA_LINES) {
		for (var i = 0; i < _items._titles.length; i++) {
			insert_html_line(i);
		}
		for (var i = 0; i < _items._titles.length; i++) {
			restore_saved_values(i, _items._titles[i], _items._urls[i]);
		}
		
		set_delete_buttons_click_events(_items._titles.length);
	}
	document.getElementById(ELEMENT_CHECKBOX).checked = _items._multientry;
}

function setup_entry_with_validation(id, value) {
	$(HASH + id).removeClass(CSS_CLASS_ERROR);
	document.getElementById(id).value = value;
	if (validate && value.length <= 0) {
		$(HASH + id).addClass(CSS_CLASS_ERROR);
	}
}

/**
  * Generates new line for next Tablinker entry
  */
function insert_html_line(i) {
	var html = document.getElementById(ELEMENT_CONTAINER).innerHTML;
	document.getElementById(ELEMENT_CONTAINER).innerHTML = html + get_next_line_html(i);
}

function get_next_line_html(i) {
	return NEXT_LINE_HTML.replace(new RegExp(PLACEHOLDER, 'g'), i);
}

function restore_saved_values(i, _title, _url) {
	var item = document.getElementById(ELEMENT_TITLE + i);
	if (item !== null) {
		item.value = _title;
	}
	item = document.getElementById(ELEMENT_URL + i);
	if (item !== null) {
		setup_entry_with_validation(ELEMENT_URL + i, _url)
	}
}

/**
  * Sets onClick listeners for dynamiacally created 'Delete' buttons. 
  */
function set_delete_buttons_click_events(limit) {
	// WORKAROUND: using delayed method to add onclick listeners for buttons.
	// Withoout this small delay onclick listener was set only for last item.
	setTimeout(function() {
		for (var i = 0; i < limit; i++) {
			document.getElementById(i).addEventListener('click', on_remove);
		}
	}, 500);
}

/**
  * Saves options to chrome.storage.sync.
  */
function on_save() {
	chrome.storage.sync.get({
		_extraLines: MIN_EXTRA_LINES,
		_titles: [],
		_urls: []
	}, function(_items) {
		validate = true;
		on_save_input(_items, true, false);
	});
}

/**
  * Saves options to chrome.storage.sync with extra options.
  *
  * @param _items		array of storage items
  * @param readInput 	flag specifying if titles and urls should be read from UI.
  * @param reload 		flag specifying if Options dialog UI should be recreated after save
  */
function on_save_input(_items, readInput, reload) {
	var title = document.getElementById(ELEMENT_TITLE).value;
	var url = document.getElementById(ELEMENT_URL).value;
	var titles = []
	var urls = []
	var multientry = document.getElementById(ELEMENT_CHECKBOX).checked;
	
	if (!readInput) {
		// use titles and urls from provided array
		titles = _items._titles;
		urls = _items._urls;
	} else if (_items._extraLines > MIN_EXTRA_LINES) {
		// read user input for all entries
		for (var i = 0; i < _items._titles.length; i++) {
			titles[i] = getTitle(i);
			urls[i] = getUrl(i);
		}
	}
	
	chrome.storage.sync.set({
		_title: title,
		_url: url,
		_extraLines: _items._extraLines,
		_titles: titles,
		_urls: urls,
		_multientry: multientry
	}, function() {
		
		if (areUrlsValid(url, urls) && !reload) {
			on_close();
		} else {
			on_load();
		}
	});
}

function areUrlsValid(url, urls) {
	if (url.length <= 0) {
		return false;
	}
	for (var i = 0; i < urls.length; i++) {
		if (urls[i].length <= 0) {
			return false;
		}
	}
	
	return true;
}

function save_and_reload(_items) {
	on_save_input(_items, true, true);
}

function save_input_provided_and_reload(_items) {
	on_save_input(_items, false, true);
}

function getTitle(i) {
	var item = document.getElementById(ELEMENT_TITLE + i);
	if (item !== null) {
		return item.value;
	}
	return '';
}

function getUrl(i) {
	var item = document.getElementById(ELEMENT_URL + i);
	if (item !== null) {
		return item.value;
	}
	return '';
}

/**
  * Restores default values. Resets any new entires.
  */
function on_restore_defaults() {
	reset_elements();
	validate = false;

	chrome.storage.sync.set({
			_title: EMPTY,
			_url: EMPTY,
			_extraLines: MIN_EXTRA_LINES,
			_titles: [],
			_urls: [],
			_multientry : true
	});
}

function reset_elements() {
	document.getElementById(ELEMENT_TITLE).value = EMPTY;
    document.getElementById(ELEMENT_URL).value = EMPTY;

	// remove any added new entires
	document.getElementById(ELEMENT_CONTAINER).innerHTML = EMPTY;
}

/**
  * Called after clicking 'remove' button. Removes selected entry annd reloads UI. 
  * Channges will be automatically saved to storage.
  */
function on_remove() {
	var id = this.id;
	validate = false;
	remove_dom_element(ELEMENT_DIV + id);
	delete_stored_data_and_reload(id);
}

function remove_dom_element(id) {
	var item = document.getElementById(id);
	item.parentNode.removeChild(item);
}

function delete_stored_data_and_reload(index) {
	chrome.storage.sync.get({
		_title: EMPTY,
		_url: EMPTY,
		_extraLines: MIN_EXTRA_LINES,
		_titles: [],
		_urls: []
	}, function(_items) {

		if (_items._extraLines > MIN_EXTRA_LINES) {
			// save input before deleting entry
			for (var i = 0; i < _items._titles.length; i++) {
				_items._titles[i] = getTitle(i);
				_items._urls[i] = getUrl(i);
			}
		}

		// delete user input for removed entry
		_items._titles.splice(index, 1);
		_items._urls.splice(index, 1);
		_items._extraLines = _items._extraLines - 1;

		save_input_provided_and_reload(_items);
	});
}

function on_close() {
	window.close();
}

/**
  * Inserts new HTML DIV to setup next shortcut link opener
  */
function on_new_entry() {
	chrome.storage.sync.get({
		_title: EMPTY,
		_url: EMPTY,
		_extraLines: MIN_EXTRA_LINES,
		_titles: [],
		_urls: []
	}, function(_items) {

		var lineCount = _items._extraLines;
		// prepare table items for user input
		_items._titles[lineCount] = EMPTY;
		_items._urls[lineCount] = EMPTY;
		lineCount = _items._extraLines + 1;
		_items._extraLines = lineCount;
		
		save_and_reload(_items);		
	});
}

/**
  * Shows help container and hides main container.
  */
function on_help() {
	show_help(true);
}

/**
  * Shows main container and hides help container.
  */
function on_back() {
	show_help(false);
}

function show_help(isHelp) {
	var mainDiv = document.getElementById(DIV_MAIN);
	var helpDiv = document.getElementById(DIV_HELP);
	toggleVisibility(helpDiv, isHelp);
	toggleVisibility(mainDiv, !isHelp);
}

function toggleVisibility(item, visible) {
	item.style.display = visible ? 'inline' : 'none';
}

document.addEventListener('DOMContentLoaded', on_load);
document.getElementById(ID_BTN_SAVE).addEventListener('click', on_save);
document.getElementById(ID_BTN_RESTORE).addEventListener('click', on_restore_defaults);
document.getElementById(ID_BTN_MORE).addEventListener('click', on_new_entry);
document.getElementById(ID_BTN_HELP).addEventListener('click', on_help);
document.getElementById(ID_BTN_BACK).addEventListener('click', on_back);