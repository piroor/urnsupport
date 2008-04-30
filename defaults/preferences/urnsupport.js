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

// powered by ASN.1 OID repository
pref("extensions.urnsupport.oid.resolver", "http://asn1.elibel.tm.fr/cgi-bin/oid/display?oid=%oid%&action=display");

// powered by XMPP Registrar
pref("extensions.urnsupport.xmpp.resolver", "http://www.xmpp.org/protocols/%urn%/");


pref("extensions.urnsupport.default.resolver", "http://www.google.com/search?q=%urn_escaped%");


pref("network.protocol-handler.expose.urn", true);


pref("extensions.{4E90A553-72C2-496f-B22E-565CB63F3604}.name", "chrome://urnsupport/locale/urnsupport.properties") ;
pref("extensions.{4E90A553-72C2-496f-B22E-565CB63F3604}.description", "chrome://urnsupport/locale/urnsupport.properties") ;
