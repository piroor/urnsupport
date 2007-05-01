const categoryManager = Components.classes['@mozilla.org/categorymanager;1']
						.getService(Components.interfaces.nsICategoryManager);

function URNRedirector()
{
}

URNRedirector.prototype = {
	get contractID() {
		return '@piro.sakura.ne.jp/urnsupport/redirector;1';
	},
	get classDescription() {
		return 'URN Redirect Service';
	},
	get classID() {
		return Components.ID('{50e7d342-dc0c-11db-8314-0800200c9a66}');
	},

	QueryInterface : function(aIID)
	{
		if (!aIID.equals(Components.interfaces.nsIContentPolicy) &&
			!aIID.equals(Components.interfaces.nsISupportsWeakReference) &&
			!aIID.equals(Components.interfaces.nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	},



	TYPE_OTHER			: Components.interfaces.nsIContentPolicy.TYPE_OTHER,
	TYPE_SCRIPT			: Components.interfaces.nsIContentPolicy.TYPE_SCRIPT,
	TYPE_IMAGE			: Components.interfaces.nsIContentPolicy.TYPE_IMAGE,
	TYPE_STYLESHEET		: Components.interfaces.nsIContentPolicy.TYPE_STYLESHEET,
	TYPE_OBJECT			: Components.interfaces.nsIContentPolicy.TYPE_OBJECT,
	TYPE_DOCUMENT		: Components.interfaces.nsIContentPolicy.TYPE_DOCUMENT,
	TYPE_SUBDOCUMENT	: Components.interfaces.nsIContentPolicy.TYPE_SUBDOCUMENT,
	TYPE_REFRESH		: Components.interfaces.nsIContentPolicy.TYPE_REFRESH,
	ACCEPT				: Components.interfaces.nsIContentPolicy.ACCEPT,
	REJECT_REQUEST		: Components.interfaces.nsIContentPolicy.REJECT_REQUEST,
	REJECT_TYPE			: Components.interfaces.nsIContentPolicy.REJECT_TYPE,
	REJECT_SERVER		: Components.interfaces.nsIContentPolicy.REJECT_SERVER,
	REJECT_OTHER		: Components.interfaces.nsIContentPolicy.REJECT_OTHER,

	shouldLoad : function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra)
	{
		if(aContentLocation.scheme != 'urn') return this.ACCEPT;

		var input   = aContentLocation.spec;
		var urnPart = input.match(/^urn:([^:]+):.+$/i);
		var output;
		var redirected = false;

		if (urnPart) {
			switch(urnPart[1].toLowerCase()) {
				default: break;
				case 'ietf':
					redirected = this.redirectURNToURLForIETF(input, aContext);
					break;
				case 'issn':
					redirected = this.redirectURNToURLForISSN(input, aContext);
					break;
				case 'isbn':
					redirected = this.redirectURNToURLForISBN(input, aContext);
					break;
				case 'publicid':
					redirected = this.redirectURNToURLForPublicId(input, aContext);
					break;
				case 'nbn':
					redirected = this.redirectURNToURLForNBN(input, aContext);
					break;
			}
		}

		if (!redirected)
			aContext.loadURI(
				this.getPref('extensions.urnsupport.default.resolver')
					.replace(/%urn%/gi, input)
					.replace(/%urn_escaped%/gi, escape(input)),
				null,
				null
			);

		return this.REJECT_REQUEST;
	},


	shouldProcess : function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra)
	{
		return this.ACCEPT;
	},




	// IETF 
	redirectURNToURLForIETF : function(aURI, aContext)
	{

		var uri = aURI;
		var urn_part = uri.match(/^urn:ietf:([^:]+):(.+)$/i);
		if (urn_part) return false;

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
				if (!param) return false;
				aContext.loadURI('http://www.ietf.org/internet-drafts/draft-'+param+'.txt', null, null);
				return true;
				break;

		}

		if (!rfcNum) return false;

		aContext.loadURI('http://www.ietf.org/rfc/rfc'+rfcNum+'.txt', null, null);

		return true;
	},


	// ISSN 
	redirectURNToURLForISSN : function(aURI, aContext)
	{
		var uri = aURI;
		var urn_part = uri.match(/^urn:issn:(\d{4}\-?\d{3}[\dx])$/i);
		if (!urn_part) return false;

		aContext.loadURI('http://urn.issn.org/urn/?issn='+urn_part[1], null, null);
		return true;
	},


	// ISBN (Powered by Amazon) 
	redirectURNToURLForISBN : function(aURI, aContext)
	{
		var uri = aURI;
		var urn_part = uri.match(/^urn:isbn:(\d{3}-)?(\d-?\d+-?\d+-?[x\d])$/i);
		if (!urn_part) return false;

		var numRaw = urn_part[2];

		var num = numRaw.replace(/-/g, '');

		var countryCode = num.substring(0, 1);
		var lang = (countryCode == 4) ? 'ja' :
					(countryCode == 1) ? 'en-uk' :
					(countryCode == 2) ? 'fr' :
					(countryCode == 3) ? 'de' :
					'default' ;

		/*
			13桁ISBNのチェックディジットは10桁ISBNのチェックディジットと異なるので、
			10桁ISBN基準で再計算する。
		*/
		var num10 = num;
		if (urn_part[2]) {
			var sum = (parseInt(num.charAt(0)) * 10) +
						(parseInt(num.charAt(1)) * 9) +
						(parseInt(num.charAt(2)) * 8) +
						(parseInt(num.charAt(3)) * 7) +
						(parseInt(num.charAt(4)) * 6) +
						(parseInt(num.charAt(5)) * 5) +
						(parseInt(num.charAt(6)) * 4) +
						(parseInt(num.charAt(7)) * 3) +
						(parseInt(num.charAt(8)) * 2);

			var digit = (sum % 11);
			if (digit) {
				digit = 11 - digit;
				if (digit == 10)
					digit = 'X';
			}

			num10 = num.replace(/.$/, digit);
		}

		switch (this.getPref('extensions.urnsupport.isbn.resolve_mode'))
		{
			case 0:
				var servers = {
					'ja'      : 'www.amazon.co.jp',
					'en-uk'   : 'www.amazon.co.uk',
					'de'      : 'www.amazon.de',
					'fr'      : 'www.amazon.fr',
					'default' : 'www.amazon.com'
				};
				url = 'http://'+servers[lang]+'/exec/obidos/ASIN/'+num10;
				break;

			case 1:
				url = this.getPref('extensions.urnsupport.isbn.resolvers.'+this.getPref('extensions.urnsupport.isbn.resolvers.selected'))
						.replace(/%isbn10%/gi, num10)
						.replace(/%isbn%/gi, num)
						.replace(/%isbn_raw%/gi, numRaw)
						.replace(/%urn%/gi, aURI)
						.replace(/%urn_escaped%/gi, escape(aURI));
				break;

			case 2:
				url = this.getPref('extensions.urnsupport.isbn.resolver')
						.replace(/%isbn10%/gi, num10)
						.replace(/%isbn%/gi, num)
						.replace(/%isbn_raw%/gi, numRaw)
						.replace(/%urn%/gi, aURI)
						.replace(/%urn_escaped%/gi, escape(aURI));
				break;
		}

		aContext.loadURI(url, null, null);
		return true;
	},


	// パブリックID（公開識別子のURI的解釈） 
	redirectURNToURLForPublicId : function(aURI, aContext)
	{
		var uri = aURI;
		var urn_part = uri.match(/^urn:publicid:(.+)$/i);
		if (!urn_part) return false;

		var url = this.getValue(this.publicIdTable, urn_part[1].replace(/:/g, '//').replace(/\+/g, ' ')); // URNから公開識別子へ変換

		if (!url) return false;

		aContext.loadURI(url, null, null);
		return true;
	},


	// NBN
	redirectURNToURLForNBN : function(aURI, aContext)
	{
		var uri = aURI;
		var urn_part = uri.match(/^urn:nbn:(.+)$/i);
		if (!urn_part) return false;

		urn_part = RegExp.$1.toLowerCase();
		urn_part.match(/(\w{2})[-:](.+)/);

		var cc = RegExp.$1;
		switch (cc)
		{
/*
			case 'jp':
				var query = [
						'SEARCH_DB_WATOSHO=SEARCH_DB_WATOSHO',
						'TA_LIBRARY_DRP=99',
						'TA_LIBRARY=01',
						'TA_TITLE=',
						'TA_TITLE_CO=SEARCH_CONDITION_AND',
						'TA_AUTHOR=',
						'TA_AUTHOR_CO=SEARCH_CONDITION_AND',
						'TA_PLACE=',
						'TA_PLACE_CO=SEARCH_CONDITION_AND',
						'TA_PUB=',
						'TA_PUB_CO=SEARCH_CONDITION_AND',
						'TA_YEAR_FR=',
						'TA_YEAR_TO=',
						'TA_KENMEI=',
						'TA_KENMEI_CO=SEARCH_CONDITION_AND',
						'TA_BUNRUI1_DRP=00',
						'TA_BUNRUI1=',
						'TA_BUNRUI1_CO=SEARCH_CONDITION_AND',
						'TA_HYOJUN1_DRP=00',
						'TA_HYOJUN1=',
						'TA_ZENKOKU1_DRP=20',
						'TA_ZENKOKU1=%s',
						'TA_SEIKYU=',
						'TA_CODE1_DRP=01',
						'TA_CODE1=',
						'TA_CODE1_CO=SEARCH_CONDITION_AND',
						'MODE_10090001%3AS2=%A1%A1%B8%A1%A1%A1%A1%A1+%BA%F7%A1%A1',
						'ACS=SEARCH_CONDITION_AND',
						'SKS=01',
						'SOS=01',
						'TOS=01',
						'DNS=01',
						'ID0=VSH',
						'PAFLG0=2',
						'TXTPATTERN0=8',
						'ANDORFLG0=3',
						'ID1=VT',
						'PAFLG1=1',
						'TXTPATTERN1=1',
						'ANDORFLG1=1',
						'ID2=VA',
						'PAFLG2=1',
						'TXTPATTERN2=1',
						'ANDORFLG2=1',
						'ID3=VPP',
						'PAFLG3=2',
						'TXTPATTERN3=1',
						'ANDORFLG3=1',
						'ID4=VPB',
						'PAFLG4=2',
						'TXTPATTERN4=1',
						'ANDORFLG4=1',
						'ID5=VYM',
						'PAFLG5=2',
						'TXTPATTERN5=1',
						'ANDORFLG5=3',
						'ID6=VSU',
						'PAFLG6=1',
						'TXTPATTERN6=1',
						'ANDORFLG6=1',
						'ID7=VCC',
						'PAFLG7=3',
						'TXTPATTERN7=1',
						'ANDORFLG7=1',
						'ID8=VSN',
						'PAFLG8=3',
						'TXTPATTERN8=1',
						'ANDORFLG8=3',
						'ID9=VJP',
						'PAFLG9=3',
						'TXTPATTERN9=1',
						'ANDORFLG9=3',
						'ID10=VCN',
						'PAFLG10=1',
						'TXTPATTERN10=1',
						'ANDORFLG10=3',
						'ID11=VCO',
						'PAFLG11=3',
						'TXTPATTERN11=1',
						'ANDORFLG11=1',
						'SHOSHI_SEARCH=SHOSHI_SEARCH',
						'SEARCH_WINDOW_INFO=02',
						'LS=7948292165',
						'1=1'
					].join('&');
				query = query.replace(/%s/, RegExp.$2);

				var postData = Components
						.classes['@mozilla.org/io/string-input-stream;1']
						.createInstance(Components.interfaces.nsIStringInputStream);
				content = 'Content-Type: application/x-www-form-urlencoded\n'+
						'Content-Length: '+query.length+'\n\n'+
						query;
				postData.setData(query, query.length);

				aContext.loadURI(
						'http://opac.ndl.go.jp/Process',
						null,
						postData
					);
				break;
*/

//			case 'de':
//			case 'se':
			default:
				aContext.loadURI(
					this.getPref('extensions.urnsupport.nbn.resolver')
						.replace(/%nbn%/gi, urn_part)
						.replace(/%urn%/gi, aURI)
						.replace(/%urn_escaped%/gi, escape(aURI)),
					null,
					null
				);
				break;

		}

		return true;
	},




/* Save/Load Prefs */ 
	 
	get Prefs() 
	{
		if (!this._Prefs) {
			this._Prefs = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch);
		}
		return this._Prefs;
	},
	_Prefs : null,
 
	getPref : function(aPrefstring) 
	{
		try {
			switch (this.Prefs.getPrefType(aPrefstring))
			{
				case this.Prefs.PREF_STRING:
					return decodeURIComponent(escape(this.Prefs.getCharPref(aPrefstring)));
					break;
				case this.Prefs.PREF_INT:
					return this.Prefs.getIntPref(aPrefstring);
					break;
				default:
					return this.Prefs.getBoolPref(aPrefstring);
					break;
			}
		}
		catch(e) {
		}

		return null;
	},
 
	setPref : function(aPrefstring, aNewValue) 
	{
		var pref = this.Prefs ;
		var type;
		try {
			type = typeof aNewValue;
		}
		catch(e) {
			type = null;
		}

		switch (type)
		{
			case 'string':
				pref.setCharPref(aPrefstring, unescape(encodeURIComponent(aNewValue)));
				break;
			case 'number':
				pref.setIntPref(aPrefstring, parseInt(aNewValue));
				break;
			default:
				pref.setBoolPref(aPrefstring, aNewValue);
				break;
		}
		return true;
	},
 
	clearPref : function(aPrefstring) 
	{
		try {
			this.Prefs.clearUserPref(aPrefstring);
		}
		catch(e) {
		}

		return;
	},



	// 変換テーブルのパス 
	ietfStdTable  : 'chrome://urnsupport/content/urn-ietf-std.properties',
	ietfFyiTable  : 'chrome://urnsupport/content/urn-ietf-fyi.properties',
	ietfIdTable   : 'chrome://urnsupport/content/urn-ietf-drafts.properties',
	publicIdTable : 'chrome://urnsupport/content/urn-publicids.properties',

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


var gModule = { 
	_firstTime: true,

	registerSelf : function (aComponentManager, aFileSpec, aLocation, aType)
	{
		if (this._firstTime) {
			this._firstTime = false;
			throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
		}
		aComponentManager = aComponentManager.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		for (var key in this._objects) {
			var obj = this._objects[key];
			aComponentManager.registerFactoryLocation(obj.CID, obj.className, obj.contractID, aFileSpec, aLocation, aType);

			categoryManager.addCategoryEntry('content-policy', obj.contractID, obj.contractID, true, true);
		}
	},

	unregisterSelf : function (aComponentManager, aFileSpec, aLocation)
	{
		aComponentManager = aComponentManager.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		for (var key in this._objects) {
			var obj = this._objects[key];
			aComponentManager.unregisterFactoryLocation(obj.CID, aFileSpec);

			categoryManager.deleteCategoryEntry('content-policy', obj.contractID, true);
		}
	},

	getClassObject : function (aComponentManager, aCID, aIID)
	{
		if (!aIID.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

		for (var key in this._objects) {
			if (aCID.equals(this._objects[key].CID))
				return this._objects[key].factory;
		}

		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	_objects : {
		manager : {
			CID        : URNRedirector.prototype.classID,
			contractID : URNRedirector.prototype.contractID,
			className  : URNRedirector.prototype.classDescription,
			factory    : {
				createInstance : function (aOuter, aIID)
				{
					if (aOuter != null)
						throw Components.results.NS_ERROR_NO_AGGREGATION;
					return (new URNRedirector()).QueryInterface(aIID);
				}
			}
		}
	},

	canUnload : function (aComponentManager)
	{
		return true;
	}
};

function NSGetModule(compMgr, fileSpec)
{
	return gModule;
}
