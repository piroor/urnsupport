/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

configs.$loaded.then(function() {
	if (configs.protocolHandlerUrl.indexOf(location.origin) !== 0)
		return;

	var handler = configs.protocolHandlerUrl + '%s';
	if (!navigator.isProtocolHandlerRegistered ||
		!navigator.isProtocolHandlerRegistered('urn', handler))
		navigator.registerProtocolHandler('urn', handler, 'URN Handler');
});
