#!/usr/local/bin/perl

use strict;

#
# this is a URN 2 URNs resolver for the ietf namespace
#


my(%cite) = (
  rfc => "/ftp/rfc/rfc-index.txt",
  fyi => "/ftp/fyi/fyi-index.txt",
  std => "/ftp/std/std-index.txt",
  bcp => "/ftp/rfc/bcp-index.txt"
);

my(%number2date) = (
  44 => "99mar",
  43 => "98dec", 42 => "98aug", 41 => "98apr",
  40 => "97dec", 39 => "97aug", 38 => "97apr",
  37 => "96dec", 36 => "96jun", 35 => "96mar",
  34 => "95dec", 33 => "95jul", 32 => "95apr",
  31 => "94dec", 30 => "94jul", 29 => "94mar",
  28 => "93nov", 27 => "93jul", 26 => "93mar",
  25 => "92nov", 24 => "92jul", 23 => "92mar",
  22 => "91nov", 21 => "91jul", 20 => "91mar",
  19 => "90dec" );

my($wgpath) = "/ftp/ietf";
my($urn) = $ENV{'QUERY_STRING'};
my($host) = $ENV{'SERVER_NAME'}; #get my host name for ftp: URLs
my($port) = $ENV={'SERVER_PORT'};
my($accept) = $ENV{'HTTP_ACCEPT'}; #this is the "Accept:" HTTP header

(&resolve1($1, $2), exit) if ($urn =~ /urn:ietf:(\w*):(\d*)/i);
(&resolve2($1, $2), exit) if ($urn =~ /urn:ietf:mtg:(\d*)-(\w*)/i);
&urn_error("400 Bad Request\n");

sub resolve2 {
  my($ietfnum, $sesnam) = @_;
  &urn_error("404 Not Found\n") if (!defined $number2date{$ietfnum});
  my($date)=$number2date{$ietfnum};
  my($link)="$wgpath/$sesnam/$sesnam-minutes-$date.txt";
  if (-f $link) {
    if ($accept =~ /text\/uri-list/) {
        print "Status: 200 OK\n";
        print "Content-type: text/uri-list\n\n\n";
        print "#$urn\n";
        return;
    }
    if ($accept =~ /\*\/\*|text]\/html/) {
      print "Status: 200 OK\n";
      print "Content-type: text/html\n\n<HTML>\n";
      print "<head><title>URN Resolution: I2Ns</title></head>\n";
      print "<BODY>\n";
      print "<h1>URN $urn resolves to the following URNs:</h1>\n";
      print "<hr><ul>\n";


      print "</UL>\n</body>\n</HTML>\n";
      return;
    }
  }
  my($link)="$wgpath/$date/$sesnam-minutes-$date.txt";
  if (-f $link) {
    if ($accept =~ /text\/uri-list/) {
        print "Status: 200 OK\n";
        print "Content-type: text/uri-list\n\n\n";
        print "#$urn\n";
        return;
    }
    if ($accept =~ /\*\/\*|text\/html/) {
        print "Status: 200 OK\n";
        print "Content-type: text/html\n\n<HTML>\n";
        print "<head><title>URN Resolution: I2Ns</title></head>\n";
        print "<BODY>\n";
        print "<h1>URN $urn resolves to the following URNs:</h1>\n";
        print "<hr><ul>\n";
        print "</UL>\n</body>\n</HTML>\n";
        return;
    }
  }
  &urn_error("404 Not Found\n");
}

sub end {
  my($inarg)=@_;
  return $inarg . "st" if ($inarg =~ /1$/);
  return $inarg . "nd" if ($inarg =~ /2$/);
  return $inarg . "rd" if ($inarg =~ /3$/);
  return $inarg . "th";
}

sub resolve1 {
  my($flag,@bib,$i,$k,$j,$done,@ref);
  my($l,$link);
  my($scheme, $value) = @_;
  $scheme =~ tr/A-Z/a-z/;
  if (!defined $cite{$scheme}) {
    &urn_error("404 Not Found\n");
  }

  $flag = 0;
  open(INPUT, "$cite{$scheme}");
  while (<INPUT>) {
    $flag = 1 if (/^0*$value /);
    if ($flag == 1) {



      last if (/^$/);
      chop;
      push @bib,$_;
    }
  }

  $k=join " ",@bib;
  while ($k =~ /(\S*)\s*(fyi|std|rfc|bcp)\s*([0-9]+)(.*)/i) {
    $k=$4;
    $a=$2; $b=$3;
    if (($a ne $scheme || $b ne $value) && ($1 !~ /obso/i)){
      $a =~ tr/A-Z/a-z/;
      $b =~ s/^0*//;
      push @ref,"urn:ietf:$a:$b";
    }
  }

MIME_SWITCH: {
    if ($accept =~ /text\/uri-list/) {
        print "Status: 200 OK\n";
        print "Content-type: text/uri-list\n\n\n";
        print "#$urn\n";
        foreach $i (@ref) {
            print "$i\n";
        }
        last MIME_SWITCH;
    }
  if ($accept =~ /\*\/\*|text\/html/) {
    print "Status: 200 OK\n";
    print "Content-type: text/html\n\n<HTML>\n";
    print "<head><title>URN Resolution: I2Ns</title></head>\n";
    print "<BODY>\n";
    print "<h1>URN $urn resolves to the following URNs:</h1>\n";
    print "<hr><ul>\n";
        foreach $i (@ref) {
            print "<li>$i: Click to resolve using\n";
            print "<a
href=\"http://$host:$port/uri-res/I2C?$i\">I2C</a>,\n";
            print "<a
href=\"http://$host:$port/uri-res/I2L?$i\">I2L</a>,\n";
            print "<a
href=\"http://$host:$port/uri-res/I2Ls?$i\">I2Ls</a>,\n";
            print "<a
href=\"http://$host:$port/uri-res/I2R?$i\">I2R</a>,\n";
            print "<a
href=\"http://$host:$port/uri-res/I2Rs?$i\">I2Rs</a>\n";
        }
    print "</UL>\n</body>\n</HTML>\n";



  }
}
}

sub make_link {
  my($sc);
  my($inarg)=@_;
  ($sc=$1) if ($inarg =~ /([a-z]*)/);
  return "/$sc/$inarg.ps" if (-e "/ftp/$sc/$inarg.ps");
  return "/$sc/$inarg.html" if (-e "/ftp/$sc/$inarg.html");
  return "/$sc/$inarg.txt";
}

sub urn_error {
  my($code) = @_; #store failure code here...

  print "Status: $code";
  print "Content-type: text/html\n\n<HTML>\n";
  print "<head><title>URN Resolution: I2Ns $code</title></head>\n";
  print "<BODY>\n";
  print "<h1>URN to URN resolution failed for the URN:</h1>\n";
  print "<hr><h3>$urn</h3>\n";
  print "</body>\n";
  print "</html>\n";
  exit;
};


