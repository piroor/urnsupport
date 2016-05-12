/*
***** BEGIN LICENSE BLOCK *****
Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this file are subject to the Mozilla Public License Version
1.1 (the "License"); you may not use this file except in compliance with
the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the
License.

The Original Code is the URN Support.

The Initial Developer of the Original Code is YUKI "Piro" Hiroshi.
Portions created by the Initial Developer are Copyright (C) 2008-2009
the Initial Developer. All Rights Reserved.

Contributor(s): YUKI "Piro" Hiroshi <piro.outsider.reflex@gmail.com>
                Maciek Niedzielski <machekku@uaznia.net>

Alternatively, the contents of this file may be used under the terms of
either the GNU General Public License Version 2 or later (the "GPL"), or
the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
in which case the provisions of the GPL or the LGPL are applicable instead
of those above. If you wish to allow use of your version of this file only
under the terms of either the GPL or the LGPL, and not to allow others to
use your version of this file under the terms of the MPL, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the GPL or the LGPL. If you do not delete
the provisions above, a recipient may use your version of this file under
the terms of any one of the MPL, the GPL or the LGPL.

***** END LICENSE BLOCK *****
*/

var URNRedirector = {
	initialized : false,

	redirectURNToURL : function(aURN)
	{
		if (!this.initialized)
			return '';

		var urnPart = aURN.match(/^urn:([^:]+):.+$/i);
		var output;
		var redirected = null;

		if (urnPart) {
			switch(urnPart[1].toLowerCase()) {

				// not implemented
				case 'uuid':
				default: break;

				case 'ietf':
					redirected = this.redirectURNToURLForIETF(aURN);
					break;
				case 'issn':
					redirected = this.redirectURNToURLForISSN(aURN);
					break;
				case 'isbn':
					redirected = this.redirectURNToURLForISBN(aURN);
					break;
				case 'publicid':
					redirected = this.redirectURNToURLForPublicId(aURN);
					break;
				case 'nbn':
					redirected = this.redirectURNToURLForNBN(aURN);
					break;
				case 'oid':
					redirected = this.redirectURNToURLForOID(aURN);
					break;
				case 'xmpp':
					redirected = this.redirectURNToURLForXMPP(aURN);
					break;
			}
		}

		log(' redirected: ' + redirected);
		if (!redirected) {
			redirected = configs.defaultResolver
							.replace(/%urn%/gi, aURN)
							.replace(/%urn_escaped%/gi, escape(aURN));
			log(' redirected by default handler: ' + redirected);
		}

		return redirected;
	},


	// IETF 
	redirectURNToURLForIETF : function(aURI)
	{
		var urn_part = aURI.match(/^urn:ietf:([^:]+):(.+)$/i);
		if (!urn_part) return null;

		var param  = urn_part[2];
		var numPart = ('000'+param.replace(/\D/g, '')).slice(-4);
		var rfcNum = '';

		switch(urn_part[1].toLowerCase()) {
			default:
				rfcNum = null;
				break;

			case 'rfc':
				rfcNum = numPart;
				break;

			case 'std':
				rfcNum = this.tables.ietfStdTable[numPart];
				break;

			case 'fyi':
				rfcNum = this.tables.ietfFyiTable[numPart];
				break;

			case 'bcp':
				rfcNum = this.tables.ietfBcpTable[numPart];
				break;

			case 'id':
				var found = this.tables.ietfIdTable[param.replace(/[^a-zA-Z\d\-]/g, '')];
				return found ? 'http://www.ietf.org/id/draft-'+param+'.txt' : null ;
		}

		return rfcNum ? 'http://www.ietf.org/rfc/rfc'+rfcNum+'.txt' : null ;
	},


	// ISSN 
	redirectURNToURLForISSN : function(aURI)
	{
		var urn_part = aURI.match(/^urn:issn:(\d{4}\-?\d{3}[\dx])$/i);
		return urn_part ? 'http://urn.issn.org/urn:issn:'+urn_part[1] : null ;
	},


	// ISBN (Powered by Amazon) 
	redirectURNToURLForISBN : function(aURI)
	{
		var urn_part = aURI.match(/^urn:isbn:([-\dx].+)/i);
		if (!urn_part) return null;

		var numRaw = urn_part[1];
		var num = numRaw.replace(/-/g, '');

		var countryCode = (num.length == 13) ? num.charAt(3) : num.charAt(0) ;
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
		if (num.length == 13) {
			num = num.slice(-10);
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

		var url;
		switch (configs.isbnResolveMode)
		{
			default:
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
				url = configs.isbnResolvers[configs.isbnResolversSelected]
						.replace(/%isbn10%/gi, num10)
						.replace(/%isbn%/gi, num)
						.replace(/%isbn_raw%/gi, numRaw)
						.replace(/%urn%/gi, aURI)
						.replace(/%urn_escaped%/gi, escape(aURI));
				break;

			case 2:
				url = configs.isbnResolver
						.replace(/%isbn10%/gi, num10)
						.replace(/%isbn%/gi, num)
						.replace(/%isbn_raw%/gi, numRaw)
						.replace(/%urn%/gi, aURI)
						.replace(/%urn_escaped%/gi, escape(aURI));
				break;
		}

		return url;
	},


	// パブリックID（公開識別子のURI的解釈） 
	redirectURNToURLForPublicId : function(aURI)
	{
		var urn_part = aURI.match(/^urn:publicid:(.+)$/i);
		if (!urn_part)
			return null;

		var key = urn_part[1].replace(/:/g, '//').replace(/\+/g, ' ');
		return this.tables.publicIdTable[key] || null;
	},


	// NBN
	redirectURNToURLForNBN : function(aURI)
	{
		var urn_part = aURI.match(/^urn:nbn:(.+)$/i);
		if (!urn_part) return null;

		var urn_part = urn_part[1].toLowerCase();
		var match = urn_part.match(/(\w{2})[-:](.+)/);

		var cc = match[1];
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
				query = query.replace(/%s/, match[2]);

				var postData = Components
						.classes['@mozilla.org/io/string-input-stream;1']
						.createInstance(Components.interfaces.nsIStringInputStream);
				content = 'Content-Type: application/x-www-form-urlencoded\n'+
						'Content-Length: '+query.length+'\n\n'+
						query;
				postData.setData(query, query.length);

				return { url : 'http://opac.ndl.go.jp/Process', postData : postData };
				break;
*/

//			case 'de':
//			case 'se':
			default:
				return configs.nbnResolver
						.replace(/%nbn%/gi, urn_part)
						.replace(/%urn%/gi, aURI)
						.replace(/%urn_escaped%/gi, escape(aURI));
		}
	},



	// OID
	redirectURNToURLForOID : function(aURI)
	{
		var urn_part = aURI.match(/^urn:oid:(.+)$/i);
		return urn_part ?
			configs.oidResolver
				.replace(/%oid%/gi, urn_part[1])
				.replace(/%urn%/gi, aURI)
				.replace(/%urn_escaped%/gi, escape(aURI)) :
			null ;
	},





	// XMPP
	redirectURNToURLForXMPP : function(aURI)
	{
		var urn_part = aURI.match(/^urn:xmpp:(.+)$/i);
		return urn_part ?
			configs.xmppResolver
				.replace(/%protocol%/gi, urn_part[1])
				.replace(/%urn%/gi, aURI)
				.replace(/%urn_escaped%/gi, escape(aURI)) :
			null ;
	},



	fetchAllTables : function()
	{
		return Tables.all.then((function(aTables) {
			this.tables = Tables.all;
		}).bind(this));
	},


	onBeforeRequest : function(aDetails) {
		log('HANDLING REQUEST: '+JSON.stringify(aDetails));
		var urn = decodeURIComponent(aDetails.url.replace(configs.protocolHandlerUrl, ''));
		if (!urn)
			return null;

		var url = this.redirectURNToURL(urn);
		log(urn + ' => ' + url);
		if (url) {
			return {
				redirectUrl: url
			};
		}

		return {
			cancel: true
		};
	},

	registerFilter : function()
	{
		chrome.webRequest.onBeforeRequest.addListener(
			this.onBeforeRequest.bind(this),
			{
				urls: [
					configs.protocolHandlerUrl + '*'
				]
			},
			[
				'blocking'
			]
		);
	},

	init : function()
	{
		return configs.$loaded
				.then((function() {
					return this.fetchAllTables();
				}).bind(this))
				.then((function() {
					this.initialized = true;
					this.registerFilter();
				}).bind(this));
	}
};

URNRedirector.init();
