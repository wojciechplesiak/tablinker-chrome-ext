/**
  * Tablinker Chrome Extension
  * Popup JS
  * @date 14/01/2016
  * @author Wojciech Plesiak 
  * @email plesiak.wojciech+tablinker@gmail.com
  */

var BUTTON_GO	 		= '#btn_go';
var BUTTON_CONFIG 		= '#btn_configure';
var BUTTON_TOOLS 		= '#tools';
var DIV_MAIN	 		= 'mainDiv';
var DIV_CONFIGURE 		= 'configureDiv';
var ELEMENT_CONTAINER   = 'container';
var ELEMENT_TITLE       = '#title';
var ELEMENT_NUMBER    	= '#ticketNumber';

var ID_NOT_CONF_TITLE	= 'not_configured_title';
var ID_NOT_CONF_DESC	= 'not_configured_description';
var ID_BTN_CONFIGURE	= 'btn_configure';
var ID_BTN_GO			= 'btn_go';

var EMPTY               = '';
var SPACE				= ' ';
var ENTER_KEY_CODE		= '13';
var PLACEHOLDER         = '%d';
var PLACEHOLDER_TICKET  = '%';

var USE_PLACEHOLDER     = false;

var FIRST_LINE_HTML = '<div class="frame"></div><input type="text" id="ticketNumber%d" placeholder="#title%d" autofocus></input><div id="title%d" class="label"><br></div>';
var NEXT_LINE_HTML  = '<div class="frame"></div><input type="text" id="ticketNumber%d" placeholder="#title%d"><div id="title%d" class="label"></input><br></div>';

/**
  * 'Go' button click handler
  */
$(function() {
	$(BUTTON_TOOLS).click(function() {
		chrome.runtime.openOptionsPage();
	});
});

/**
  * 'Go' button click handler
  */
$(function() {
	$(BUTTON_GO).click(function() {
		openTickets();
	});
});

/**
  * 'ENTER' key click handler
  */
$(function() {
	$(document).keypress(function(e) {
		if (e.keyCode == ENTER_KEY_CODE) {
			openTickets();
		}
	});
});

/**
  * 'Configure' button click handler
  */
$(function() {
	$(BUTTON_CONFIG).click(function() {
		chrome.runtime.openOptionsPage();
	});
});

function openTickets() {
	chrome.storage.sync.get({
		_url: '',
		_urls: [],
		_multientry: true
	}, function(_items) {
		_items._urls.splice(0, 0, _items._url);
		for (var i = 0; i < _items._urls.length; i++) {
			var ticketNumber = $(ELEMENT_NUMBER + i).val();
			if (ticketNumber != null && ticketNumber.length > 0) {
				var tickets = [ticketNumber];
				if (_items._multientry) {
					tickets = ticketNumber.split(SPACE);
				} 
				for (var j = 0; j < tickets.length; j++) {
					openTicket(_items._urls[i], tickets[j]);
				}
			}
		}
	});
}

function openTicket(baseurl, ticketNumber) {
	var url = build_url(baseurl, ticketNumber);
	chrome.tabs.create({url: url});
}

function build_url(baseurl, ticketNumber) {
	if (baseurl.indexOf(PLACEHOLDER_TICKET) > 0) {
		return baseurl.replace(new RegExp(PLACEHOLDER_TICKET, 'g'), ticketNumber);
	} else {
		return baseurl + ticketNumber;
	}
}

$(document).ready(function() {
	localize_page();
	chrome.storage.sync.get({
		_title: EMPTY,
		_url: EMPTY,
		_titles: [],
		_urls: []
	}, function(_items) {
		var configured = is_configured(_items);
		show_proper_div(configured);
		if (configured) {
			build_entries(_items);
		}
	});
});

function localize_page() {
	document.getElementById(ID_NOT_CONF_TITLE).textContent = chrome.i18n.getMessage(ID_NOT_CONF_TITLE);
	document.getElementById(ID_NOT_CONF_DESC).textContent = chrome.i18n.getMessage(ID_NOT_CONF_DESC);
	document.getElementById(ID_BTN_CONFIGURE).value = chrome.i18n.getMessage(ID_BTN_CONFIGURE);
	document.getElementById(ID_BTN_GO).value = chrome.i18n.getMessage(ID_BTN_GO);
}

function is_configured(_items) {
	return _items._url.length > 0
}

function show_proper_div(configured) {
	var configureDiv = document.getElementById(DIV_CONFIGURE);
	var mainDiv = document.getElementById(DIV_MAIN);
	toggleVisibility(configureDiv, !configured);
	toggleVisibility(mainDiv, configured);
}

function toggleVisibility(item, visible) {
	item.style.display = visible ? 'inline' : 'none';
}

function build_entries(_items) {
	// insert default as a first element
	_items._titles.splice(0, 0, _items._title);
	_items._urls.splice(0, 0, _items._url);
	
	for (var i = 0; i < _items._titles.length; i++) {
		if (isUrlValid(_items._urls[i])) {
			insert_html_line(i, _items._titles[i]);
		}
	}
	for (var i = 0; i < _items._titles.length; i++) {
		if (isUrlValid(_items._urls[i])) {
			set_title(i, _items._titles[i]);
		}
	}
}

function isUrlValid(url) {
	return isText(url);
}

function isText(str) {
	return str != null && str.length > 0;
}

function insert_html_line(i, title) {
	var html = document.getElementById(ELEMENT_CONTAINER).innerHTML;
	html = html + get_next_line_html(i);
	html = setPlaceholderIfNeeded(html, i, title);
	document.getElementById(ELEMENT_CONTAINER).innerHTML = html;
}

function get_next_line_html(i) {
	var html = (i == 0 ? FIRST_LINE_HTML : NEXT_LINE_HTML);
	return html.replace(new RegExp(PLACEHOLDER, 'g'), i);
}

function setPlaceholderIfNeeded(html, i, title) {
	var str = title;
	if (!USE_PLACEHOLDER) {
		str = EMPTY;
	}
	return html.replace(new RegExp(ELEMENT_TITLE + i, 'g'), str);
}

function set_title(i, title) {
	if (isText(title)) {
		$(ELEMENT_TITLE + i).text(title.toUpperCase());
	}
}