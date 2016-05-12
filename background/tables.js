/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var Tables = {
	get all() {
		delete this.all;
		return new Promise((function(aResolve, aReject) {
			var tables = {};
			var promises = [];
			promises.push(this.ietfStdTable.then(function(aTable) {
				tables.ietfStdTable = aTable;
			}));
			promises.push(this.ietfFyiTable.then(function(aTable) {
				tables.ietfFyiTable = aTable;
			}));
			promises.push(this.ietfBcpTable.then(function(aTable) {
				tables.ietfBcpTable = aTable;
			}));
			promises.push(this.ietfIdTable.then(function(aTable) {
				tables.ietfIdTable = aTable;
			}));
			promises.push(this.publicIdTable.then(function(aTable) {
				tables.publicIdTable = aTable;
			}));
			Promise.all(promises).then(function() {
				aResolve(tables);
			});
		}).bind(this));
	},

	get ietfStdTable() {
		delete this.ietfStdTable;
		return this.ietfStdTable = this.readTable('./urn-ietf-std.properties');
	},
	get ietfFyiTable() {
		delete this.ietfFyiTable;
		return this.ietfFyiTable = this.readTable('./urn-ietf-fyi.properties');
	},
	get ietfBcpTable() {
		delete this.ietfBcpTable;
		return this.ietfBcpTable = this.readTable('./urn-ietf-bcp.properties');
	},
	get ietfIdTable() {
		delete this.ietfIdTable;
		return this.ietfIdTable = this.readTable('./urn-ietf-drafts.properties');
	},
	get publicIdTable() {
		delete this.publicIdTable;
		return this.publicIdTable = this.readTable('./urn-publicids.properties');
	},

	readTable : function(aSource)
	{
		return new Promise((function(aResolve, aReject) {
			var request = new XMLHttpRequest();
			request.open('GET', aSource, true);
			request.onreadystatechange = function() {
				if (request.readyState != 4)
					return;

				var source = request.responseText;
				var table = {};
				source.split('\n').forEach(function(aLine) {
					var matched = aLine.match(/^([^=]+)=(.*)/);
					if (!matched)
						return;
					var key = matched[0].trim();
					var value = matched[1].trim();
					table[key] = value;
				});
				aResolve(table);
			};
			request.onerror = function(aError) {
				aReject(aError);
			};
			try {
				request.send();
			}
			catch(aError) {
				aReject(aErrlr);
			}
		}).bind(this));
	}
};
