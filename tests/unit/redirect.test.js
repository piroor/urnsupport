utils.include('../../components/urnRedirector.js', 'Shift_JIS');

var sv;
var table = utils.readParametersFromTSV('../fixtures/table.tsv');

function warmUp()
{
	utils.loadPrefs('../../defaults/preferences/urnsupport.js');
}

function setUp()
{
	sv = new URNRedirector();
}

function tearDown()
{
	sv = null;
}


test_redirectURNToURLForIETF.parameters = table;
function test_redirectURNToURLForIETF(aParameter)
{
	var redirected = sv.redirectURNToURLForIETF(aParameter.urn);
	if (aParameter.type == 'ietf')
		assert.equals(aParameter.url, redirected);
	else
		assert.isNull(redirected);
}

test_redirectURNToURLForISSN.parameters = table;
function test_redirectURNToURLForISSN(aParameter)
{
	var redirected = sv.redirectURNToURLForISSN(aParameter.urn);
	if (aParameter.type == 'issn')
		assert.equals(aParameter.url, redirected);
	else
		assert.isNull(redirected);
}

test_redirectURNToURLForISBN.parameters = table;
function test_redirectURNToURLForISBN(aParameter)
{
	var redirected = sv.redirectURNToURLForISBN(aParameter.urn);
	if (aParameter.type == 'isbn')
		assert.equals(aParameter.url, redirected);
	else
		assert.isNull(redirected);
}

test_redirectURNToURLForPublicId.parameters = table;
function test_redirectURNToURLForPublicId(aParameter)
{
	var redirected = sv.redirectURNToURLForPublicId(aParameter.urn);
	if (aParameter.type == 'publicid')
		assert.equals(aParameter.url, redirected);
	else
		assert.isNull(redirected);
}

test_redirectURNToURLForNBN.parameters = table;
function test_redirectURNToURLForNBN(aParameter)
{
	var redirected = sv.redirectURNToURLForNBN(aParameter.urn);
	if (aParameter.type == 'nbn')
		assert.equals(aParameter.url, redirected);
	else
		assert.isNull(redirected);
}

test_redirectURNToURLForOID.parameters = table;
function test_redirectURNToURLForOID(aParameter)
{
	var redirected = sv.redirectURNToURLForOID(aParameter.urn);
	if (aParameter.type == 'oid')
		assert.equals(aParameter.url, redirected);
	else
		assert.isNull(redirected);
}

test_redirectURNToURLForXMPP.parameters = table;
function test_redirectURNToURLForXMPP(aParameter)
{
	var redirected = sv.redirectURNToURLForXMPP(aParameter.urn);
	if (aParameter.type == 'xmpp')
		assert.equals(aParameter.url, redirected);
	else
		assert.isNull(redirected);
}

test_redirectURNToURL.parameters = table;
function test_redirectURNToURL(aParameter)
{
	var redirected = sv.redirectURNToURL(aParameter.urn);
	assert.equals(aParameter.url, redirected);
}

