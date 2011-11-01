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

The Initial Developer of the Original Code is SHIMODA Hiroshi.
Portions created by the Initial Developer are Copyright (C) 2008
the Initial Developer. All Rights Reserved.

Contributor(s): SHIMODA Hiroshi <piro.outsider.reflex@gmail.com>
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

// 0 = amazon(auto-detect), 1 = selected, 2 = manual
pref("extensions.urnsupport.isbn.resolve_mode", 0);

pref("extensions.urnsupport.isbn.resolvers.selected", 0);
pref("extensions.urnsupport.isbn.resolvers.0", "http://www.amazon.com/exec/obidos/ASIN/%isbn10%");
pref("extensions.urnsupport.isbn.resolvers.1", "http://www.amazon.co.jp/exec/obidos/ASIN/%isbn10%");
pref("extensions.urnsupport.isbn.resolvers.2", "http://www.amazon.co.uk/exec/obidos/ASIN/%isbn10%");
pref("extensions.urnsupport.isbn.resolvers.3", "http://www.amazon.de/exec/obidos/ASIN/%isbn10%");
pref("extensions.urnsupport.isbn.resolvers.4", "http://www.amazon.fr/exec/obidos/ASIN/%isbn10%");

pref("extensions.urnsupport.isbn.resolver", "http://www.google.com/search?q=ISBN+%isbn_raw%");

// powered by German National Library
pref("extensions.urnsupport.nbn.resolver", "http://nbn-resolving.org/urn/resolver.pl?urn=%urn%");

// powered by OID Repository 
pref("extensions.urnsupport.oid.resolver", "http://www.oid-info.com/cgi-bin/display?oid=%oid%&submit=Display&action=display");

// powered by XMPP Registrar
pref("extensions.urnsupport.xmpp.resolver", "http://xmpp.org/protocols/%urn%/");


pref("extensions.urnsupport.default.resolver", "http://www.google.com/search?q=%urn_escaped%");


pref("network.protocol-handler.expose.urn", true);


pref("extensions.{4E90A553-72C2-496f-B22E-565CB63F3604}.name", "chrome://urnsupport/locale/urnsupport.properties") ;
pref("extensions.{4E90A553-72C2-496f-B22E-565CB63F3604}.description", "chrome://urnsupport/locale/urnsupport.properties") ;
