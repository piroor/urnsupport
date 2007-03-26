var IOService = Components.classes['@mozilla.org/network/io-service;1']
				.getService(Components.interfaces.nsIIOService);


function URNProtocol()
{
}

URNProtocol.prototype = {
	get contractID() {
		return '@mozilla.org/network/protocol;1?name=urn';
	},
	get classDescription() {
		return 'URN Protocol';
	},
	get classID() {
		return Components.ID('{4ead4d4a-db77-11db-8314-0800200c9a66}');
	},

	QueryInterface: function(aIID)
	{
		if (!aIID.equals(Components.interfaces.nsIProtocolHandler) &&
			!aIID.equals(Components.interfaces.nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	},


	/* implementation */

	scheme        : 'urn',
	defaultPort   : -1,
	protocolFlags : Components.interfaces.nsIProtocolHandler.URI_NORELATIVE | Components.interfaces.nsIProtocolHandler.URI_NOAUTH,

	allowPort: function(aPort, aScheme)
	{
		return false;
	},

	newURI: function(aSpec, aCharset, aBaseURI)
	{
		var uri = Components.classes['@mozilla.org/network/simple-uri;1']
					.createInstance(Components.interfaces.nsIURI);
		uri.spec = aSpec;
		return uri;
	},

	newChannel: function(aURI)
	{
		var input   = aURI.spec;
		var urnPart = input.match(/^urn:([^:]+):.+$/i);
		var output;

		if (urnPart) {
			switch(urnPart[1].toLowerCase()) {
				default: break;
				case 'ietf':     output = this.getURLFromURNForIETF(input); break;
				case 'issn':     output = this.getURLFromURNForISSN(input); break;
				case 'isbn':     output = this.getURLFromURNForISBN(input); break;
				case 'publicid': output = this.getURLFromURNForPublicId(input); break;
			}
		}
		else {
			throw 'Invalid URN';
		}

		var channel = IOService.newChannel(output, null, null);
/*
		try {
			channel = channel.QueryInterface(Components.interfaces.nsIHttpChannel);
			channel.setRequestHeader('location', output, false);
		}
		catch(e) {
		}
*/
		return channel;
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
		var urn_part = uri.match(/^urn:isbn:(\d{3}-)?(\d-?\d+-?\d+-?[x\d])$/i);
		if (!urn_part) return uri;

		var num = urn_part[2].replace(/-/g, '');

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

			num = num.replace(/.$/, digit);
		}

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
			CID        : URNProtocol.prototype.classID,
			contractID : URNProtocol.prototype.contractID,
			className  : URNProtocol.prototype.classDescription,
			factory    : {
				createInstance : function (aOuter, aIID)
				{
					if (aOuter != null)
						throw Components.results.NS_ERROR_NO_AGGREGATION;
					return (new URNProtocol()).QueryInterface(aIID);
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
