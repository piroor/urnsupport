const kSCHEMER = 'urn';

const IOService = Components.classes['@mozilla.org/network/io-service;1']
				.getService(Components.interfaces.nsIIOService);


function URNProtocol()
{
}

URNProtocol.prototype = {
	get contractID() {
		return '@mozilla.org/network/protocol;1?name='+kSCHEMER;
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

	scheme        : kSCHEMER,
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
		try {
			uri.spec = aSpec;
		}
		catch(e) {
			dump(e+'\n');
		}
		return uri;
	},

	newChannel: function(aURI)
	{
		var channel = IOService.newChannel('about:blank', null, null);
		return channel;
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

	unregisterSelf : function (aComponentManager, aFileSpec, aLocation)
	{
		aComponentManager = aComponentManager.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		for (var key in this._objects) {
			var obj = this._objects[key];
			aComponentManager.unregisterFactoryLocation(obj.CID, aFileSpec);
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
