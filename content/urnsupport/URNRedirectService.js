/*
"URN Redirecter" 

original Perl version made by Fuji.(KONDOU Kazuhiro)
http://www.alib.jp/
http://www.alib.jp/perl/w3m_urn.html

JavaScript version for XUL applications made by Piro(SHIMODA Hiroshi)
http://piro.sakura.ne.jp/
*/
 
var URNRedirectService = 
{

	initialized : false,
	
	// 変換テーブルのパス 
	ietfStdTable  : 'chrome://extensions/content/urn/urn-ietf-std.properties',
	ietfFyiTable  : 'chrome://extensions/content/urn/urn-ietf-fyi.properties',
	ietfIdTable   : 'chrome://extensions/content/urn/urn-ietf-drafts.properties',
	publicIdTable : 'chrome://extensions/content/urn/urn-publicids.properties',
 
	init : function() 
	{
		if (this.initialized) return;

		var funcs = [
				'loadURI',
				'BrowserLoadURL',
				'contentAreaClick',
				'handleLinkClick',
				'openNewTabWith',
				'openNewWindowWith',
				'openNewTabLocation'
			];
		for (var i in funcs)
			if (funcs[i] in window) {
				window['__urnsupport__'+funcs[i]] = window[funcs[i]];
				window[funcs[i]] = this[funcs[i]];
			}

		this.initialized = true;
	},
 
	// URNをURLにリダイレクトする 
	// 不正なURNや、リダイレクト先が見つからない場合、渡されたURIをそのまま返す
	getURLFromURI : function(aURI)
	{
		//return 'http://www.alib.jp/cgi-bin/urn.cgi?'+uri;

		var uri = aURI.constructor == Array ? aURI[0] : aURI.toString() ;

		var urn_part = uri.match(/^urn:([^:]+):.+$/i);
		if (!urn_part) return aURI;

		switch(urn_part[1].toLowerCase()) {
			default: break;
			case 'ietf':     uri = this.getURLFromURNForIETF(uri); break;
			case 'issn':     uri = this.getURLFromURNForISSN(uri); break;
			case 'isbn':     uri = this.getURLFromURNForISBN(uri); break;
			case 'publicid': uri = this.getURLFromURNForPublicId(uri); break;
		}

		return uri;
	},
	
	// IETF 
	getURLFromURNForIETF : function(aURI)
	{

		var uri = aURI;
		var urn_part = uri.match(/^urn:ietf:([^:]+):(.+)$/i);
		if (!urn_part) return uri;

		var param  = urn_part[2],
			rfcNum = '';

		switch(urn_part[1].toLowerCase()) {
			default: break;

			case 'rfc':
				rfcNum = param.replace(/\D/g, '');
				break;

			case 'std':
				rfcNum = this.getValue(this.ietfStdTable, param.replace(/\D/g, ''));
				break;

			case 'fyi':
				rfcNum = this.getValue(this.ietfFyiTable, param.replace(/\D/g, ''));
				break;

			case 'id':
				param = this.getValue(this.ietfIdTable, param.replace(/[^a-zA-Z\d\-]/g, ''));
				if (param) return 'http://www.ietf.org/internet-drafts/draft-'+param+'.txt';
				break;

		}

		return (rfcNum) ? 'http://www.ietf.org/rfc/rfc'+rfcNum+'.txt' : uri ;
	},
 
	// ISSN 
	getURLFromURNForISSN : function(aURI)
	{
		var uri = aURI;
		var urn_part = uri.match(/^urn:issn:(\d{4}\-\d{3}[\dx])$/i);
		return (urn_part) ? 'http://urn.issn.org/urn/?issn='+urn_part[1] : uri ;
	},

 
	// ISBN (Powered by Amazon) 
	getURLFromURNForISBN : function(aURI)
	{
		var uri = aURI;
		var urn_part = uri.match(/^urn:isbn:(\d-?\d+-?\d+-?[x\d])$/i);
		if (!urn_part) return uri;

		var num = urn_part[1].replace(/-/g, '');

		var countryCode = num.substring(0, 1);
		var lang = (countryCode == 4) ? 'ja' :
					(countryCode == 1) ? 'en-uk' :
					(countryCode == 2) ? 'fr' :
					(countryCode == 3) ? 'de' :
					'default' ;

		var servers = {
			'ja'      : 'www.amazon.co.jp',
			'en-uk'   : 'www.amazon.co.uk',
			'de'      : 'www.amazon.de',
			'fr'      : 'www.amazon.fr',
			'default' : 'www.amazon.com'
		};
		return 'http://'+servers[lang]+'/exec/obidos/ASIN/'+num;
	},
 
	// パブリックID（公開識別子のURI的解釈） 
	getURLFromURNForPublicId : function(aURI)
	{
		var uri = aURI;
		var urn_part = uri.match(/^urn:publicid:(.+)$/i);
		if (!urn_part) return uri;

		var url = this.getValue(this.publicIdTable, urn_part[1].replace(/:/g, '//').replace(/\+/g, ' ')); // URNから公開識別子へ変換
		return (url) ? url : uri ;
	},
  
	// 関数の上書き 
	
	loadURI : function(aURI, aSecondArg, aThirdArg) 
	{
		return window.__urnsupport__loadURI(URNRedirectService.getURLFromURI(aURI), aSecondArg, aThirdArg);
	},
 
	BrowserLoadURL : function(aEvent, aPostData, aOriginalURI, aSearchURL) 
	{
		var urlbar = document.getElementById('urlbar');
		urlbar.value = URNRedirectService.getURLFromURI(urlbar.value);

		return window.__urnsupport__BrowserLoadURL(aEvent, aPostData, aOriginalURI, aSearchURL);
	},
 
	contentAreaClick : function(aEvent, aFieldNormalClicks) 
	{
		var node = aEvent.target;
		if (node.nodeType == Node.ELEMENT_NODE) {
			var uri = ('href' in node) ? node.href :
					node.getAttributeNS('http://www.w3.org/1999/xhtml', 'href') ||
					node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
					node.getAttribute('href');
			var url = '';
			if (uri && uri.match(/^urn:/i)) {
				url = URNRedirectService.getURLFromURI(uri);

				if ('href' in node && node.href)
					node.href = url;
				if (node.getAttributeNS('http://www.w3.org/1999/xhtml', 'href'))
					node.setAttributeNS('http://www.w3.org/1999/xhtml', 'xhtml:href', url);
				if (node.getAttributeNS('http://www.w3.org/1999/xlink', 'href'))
					node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url);
				if (node.getAttribute('href'))
					node.setAttribute('href', url);
			}
		}

		var retVal;
		try {
			retVal = window.__urnsupport__contentAreaClick(aEvent, aFieldNormalClicks);
		}
		catch(e) {
		}

		if (url) {
			window.setTimeout(
				function(aNode, aURI)
				{
					if ('href' in aNode && aNode.href)
						aNode.href = aURI;
					if (aNode.getAttributeNS('http://www.w3.org/1999/xhtml', 'href'))
						aNode.setAttributeNS('http://www.w3.org/1999/xhtml', 'xhtml:href', aURI);
					if (aNode.getAttributeNS('http://www.w3.org/1999/xlink', 'href'))
						aNode.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', aURI);
					if (aNode.getAttribute('href'))
						aNode.setAttribute('href', aURI);
				},
				0,
				node,
				uri
			);
		}

		return retVal;
	},
 
	handleLinkClick : function(aEvent, aURI, aNode) 
	{
		var doneFlag = window.__urnsupport__handleLinkClick(aEvent, URNRedirectService.getURLFromURI(aURI), aNode);

		var urnFlag = aURI.match(/^urn:/i);
		if (!doneFlag && urnFlag && aEvent.button == 0) {
			uri = URNRedirectService.getURLFromURI(aURI);
			var referrer = Components.classes['@mozilla.org/network/io-service;1']
                          .getService(Components.interfaces.nsIIOService)
                          .newURI(aEvent.target.ownerDocument.location.href, null, null);
			loadURI(uri, aReferrer);
		}

		return doneFlag;
	},
 
	openNewTabWith : function(aURI, aSecondArg, aThirdArg) 
	{
		return window.__urnsupport__openNewTabWith(URNRedirectService.getURLFromURI(aURI), aSecondArg, aThirdArg);
	},
 
	openNewWindowWith : function(aURI, aSecondArg, aThirdArg) 
	{
		return window.__urnsupport__openNewWindowWith(URNRedirectService.getURLFromURI(aURI), aSecondArg, aThirdArg);
	},
 
	// for MultiZilla 
	openNewTabLocation : function(aURI)
	{
		return window.__urnsupport__openNewTabLocation(URNRedirectService.getURLFromURI(aURI));
	},
  
	// 変換テーブルの値を得る 
	getValue : function(aSource, aKey)
	{
		const stringBundleService = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);

		var strbundle = stringBundleService.createBundle(aSource);
		var items = strbundle.getSimpleEnumeration(),
			item;
		while (items.hasMoreElements()) {
			item = items.getNext();
			item = item.QueryInterface(Components.interfaces.nsIPropertyElement);

			if (item.key == aKey) return item.value || item.key;
		}

		return '';
	}
 
}; 
  
// initializing 
// I have to add listeners twice because sometimes window fails to call the first listener.
window.addEventListener(
'load',
function()
{
	window.setTimeout('URNRedirectService.init();', 10);
},
false
);
window.addEventListener(
'load',
function()
{
	window.setTimeout('URNRedirectService.init();', 10);
},
false
);
 
