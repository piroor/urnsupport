/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

if (chrome.runtime.onInstalled) {
	chrome.runtime.onInstalled.addListener(function(aDetail) {
		switch (aDetails.reason)
		{
			case 'update':
			case 'install':
				configs.$loaded.then(function() {
					chrome.tabs.create({
						url    : configs.protocolHandlerUrl,
						active : true
					});
				});
				break;
		}
	});
}
