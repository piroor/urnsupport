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
Portions created by the Initial Developer are Copyright (C) 2008
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


var DEBUG = true;

function log(aMessage, ...aArgs)
{
	if (!DEBUG)
		return;

	if (aArgs.length > 0)
		console.log(aMessage, aArgs);
	else
		console.log(aMessage);
}

var configs = new Configs({
	protocolHandlerUrl: 'https://piro.sakura.ne.jp/xul/urnsupport/handler?urn=',

	// 0 = amazon(auto-detect), 1 = selected, 2 = manual
	isbnResolveMode: 0,
	isbnResolversSelected: 0,
	isbnResolvers: [
		'http://www.amazon.com/exec/obidos/ASIN/%isbn10%',
		'http://www.amazon.co.jp/exec/obidos/ASIN/%isbn10%',
		'http://www.amazon.co.uk/exec/obidos/ASIN/%isbn10%',
		'http://www.amazon.de/exec/obidos/ASIN/%isbn10%',
		'http://www.amazon.fr/exec/obidos/ASIN/%isbn10%'
	],
	isbnResolver: 'http://www.google.com/search?q=ISBN+%isbn_raw%',

	// powered by German National Library
	nbnResolver: 'http://nbn-resolving.org/urn/resolver.pl?urn=%urn%',

	// powered by OID Repository 
	oidResolver: 'http://www.oid-info.com/cgi-bin/display?oid=%oid%&submit=Display&action=display',

	// powered by XMPP Registrar
	xmppResolver: 'http://xmpp.org/protocols/%urn%/',

	defaultResolver: 'http://www.google.com/search?q=%urn_escaped%'
});
