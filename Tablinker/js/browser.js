/**
  * Urly Chrome Extension
  * Browser JS
  * @date 02/02/2016
  * @author Wojciech Plesiak 
  * @email plesiak.wojciech+urly@gmail.com
  */
  
var EMPTY               = '';
var MIN_EXTRA_LINES     = 0;

/**
  * Opens Options page
  */
function browser_openOptionsPage() {
	if (isChrome()) {
		chrome.runtime.openOptionsPage();
	} else if (isFirefox()) {
		chrome.tabs.create({
		  "url": chrome.extension.getURL("options.html")
		}); 
	}
}	

/**
  * Opens given url in a new tab
  */
function browser_openInNewTab(url) {
	chrome.tabs.create({url: url});
}

/**
  * Gets localized string
  */
function browser_getMessage(str) {
	return chrome.i18n.getMessage(str);
}

/**
  * Gets stored settings and returns them in array.
  * Calls callback passing that array in a parameter.
  * @param callback - a function to be called when settings are fetched
  */
function browser_getSettings(callback) {
	if (isChrome()) {
		chrome.storage.sync.get({
			_title: EMPTY,
			_url: EMPTY,
			_titles: [],
			_urls: [],
			_multientry: true,
			_extraLines: MIN_EXTRA_LINES
		}, function(_items) {
			callback(_items);
		});
	} else if (isFirefox()) {
		chrome.storage.local.get({
			_title: EMPTY,
			_url: EMPTY,
			_titles: [],
			_urls: [],
			_multientry: true,
			_extraLines: MIN_EXTRA_LINES
		}, function(_items) {
			callback(_items);
		}); 
	}
}

/**
  * Saves settings and calls callback method.
  * @param callback - a function to be called when settings are stored
  */
function browser_saveSettings(callback, title, url, titles, urls, multientry, extraLines) {
	if (isChrome()) {
		chrome.storage.sync.set({
			_title: title,
			_url: url,
			_titles: titles,
			_urls: urls,
			_multientry: multientry,
			_extraLines: extraLines
		}, function() {
			callback();
		});
	} else if (isFirefox()) {
		chrome.storage.local.set({
			_title: title,
			_url: url,
			_titles: titles,
			_urls: urls,
			_multientry: multientry,
			_extraLines: extraLines
		}, function() {
			callback();
		});
	}
}