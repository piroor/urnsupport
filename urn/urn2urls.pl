#!/usr/local/bin/perl

use strict;

#
# this is a URN 2 URLs resolver for the ietf namespace
#

my(@urls);

my(%pathbase) = (
  rfc => "rfc/rfc",
  fyi => "fyi/fyi",
  std => "std/std",
  bcp => "bcp/bcp",
  id => "internet-drafts/draft-"
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
my($accept) = $ENV{'HTTP_ACCEPT'}; #this is the "Accept:" HTTP header

(&resolveid($1), exit) if ($urn =~ /urn:ietf:id:(\S+)/i);
(&resolve1($1, $2), exit) if ($urn =~ /urn:ietf:(\w*):(\d*)/i);
(&resolve2($1, $2), exit) if ($urn =~ /urn:ietf:mtg:(\d*)-(\w*)/i);
&urn_error("400 Bad Request\n");

sub resolve2 {
  my($ietfnum, $sesnam) = @_;
  &urn_error("404 Not Found\n") if (!defined $number2date{$ietfnum});
  my($date)=$number2date{$ietfnum};
  my($link)="$wgpath/$sesnam/$sesnam-minutes-$date.txt";
  if (-f $link) {



    $link=~s/^\/ftp\///;
    my($ftplink)="ftp://$host/$link";
    my($httplink)="http://$host/$link";
    my($glink)="gopher://$host:70/0/$link";

    if ($accept =~ /text\/uri-list/) { #look for text/uri-list,
        otherwise text/html
      print "Status: 200 OK\n";
      print "Content-type: text/uri-list\n\n\n";
      print "#$urn\n";
      print "$ftplink\n";
      print "$httplink\n";
      print "$glink\n";
    }
    if ($accept =~ /\*\/\*|text\/html/) {
      print "Status: 200 OK\n";
      print "Content-type: text/html\n\n<HTML>\n";
      print "<head><title>URN Resolution: I2Ls</title></head>\n";
      print "<BODY>\n";
      print "<h1>URN $urn resolves to the following URLs:</h1>\n";
      print "<hr><ul>\n";
      print "<a href=\"$ftplink\">$ftplink</a>\n";
      print "<a href=\"$httplink\">$httplink</a>\n";
      print "<a href=\"$glink\">$glink</a>\n";
      print "</UL>\n</body>\n</HTML>\n";
    }
    return;
  }
  my($link)="$wgpath/$date/$sesnam-minutes-$date.txt";
  if (-f $link) {
    $link=~s/^\/ftp\///;
    my($ftplink)="ftp://$host/$link";
    my($httplink)="http://$host/$link";
    my($glink)="gopher://$host:70/0/$link";
    if ($accept =~ /text\/uri-list/) { #look for text/uri-list,
        otherwise text/html
      print "Status: 200 OK\n";
      print "Content-type: text/uri-list\n\n\n";
      print "#$urn\n";
      print "$ftplink\n";
      print "$httplink\n";
      print "$glink\n";
    }
    if ($accept =~ /\*\/\*|text\/html/) {
      print "Status: 200 OK\n";
      print "Content-type: text/html\n\n<HTML>\n";
      print "<head><title>URN Resolution: I2Ls</title></head>\n";
      print "<BODY>\n";



      print "<h1>URN $urn resolves to the following URLs:</h1>\n";
      print "<hr><ul>\n";
      print "<a href=\"$ftplink\">$ftplink</a>\n";
      print "<a href=\"$httplink\">$httplink</a>\n";
      print "<a href=\"$glink\">$glink</a>\n";
      print "</UL>\n</body>\n</HTML>\n";
    }

    return;
  }
  &urn_error("404 Not Found\n");
}

sub resolve1 {
  my($flag,@bib,$i,$k,$j,$done,@ref);
  my($l,$link);
  my($scheme, $value) = @_;
  $scheme =~ tr/A-Z/a-z/;
  &urn_error("404 Not Found\n")if (!defined $pathbase{$scheme});
  my($try)="/ftp/$pathbase{$scheme}$value.txt";
  if (-f $try) {
    push(@urls, "http://$host/$pathbase{$scheme}$value.txt");
    push(@urls, "ftp://$host/$pathbase{$scheme}$value.txt");
    push(@urls, "gopher://$host:70/0/$pathbase{$scheme}$value.txt");
  }
  $try="/ftp/$pathbase{$scheme}$value.ps";
  if (-f $try) {
    push(@urls, "http://$host/$pathbase{$scheme}$value.ps");
    push(@urls, "ftp://$host/$pathbase{$scheme}$value.ps");
    push(@urls, "gopher://$host:70/0/$pathbase{$scheme}$value.ps");
  }
  $try="/ftp/$pathbase{$scheme}$value.html";
  if (-f $try) {
    push(@urls, "http://$host/$pathbase{$scheme}$value.html");
    push(@urls, "ftp://$host/$pathbase{$scheme}$value.html");
  }

  &urn_error("404 Not Found\n") if ($#urls == -1);

MIME_SWITCH: {
    if ($accept =~ /text\/uri-list/) { #look for text/uri-list,
        otherwise text/html
      print "Status: 200 OK\n";
      print "Content-type: text/uri-list\n\n\n";
      print "#$urn\n";
      foreach $i (@urls) {
        print "$i\n";
      }


      last MIME_SWITCH;
    }
    if ($accept =~ /\*\/\*|text\/html/) {
      print "Status: 200 OK\n";
      print "Content-type: text/html\n\n<HTML>\n";
      print "<head><title>URN Resolution: I2Ls</title></head>\n";
      print "<BODY>\n";
      print "<h1>URN $urn resolves to the following URLs:</h1>\n";
      print "<hr><ul>\n";
      foreach $i (@urls) {
        print "<LI><A HREF=\"$i\">$i</A>\n";
      }
      print "</UL>\n</body>\n</HTML>\n";
      last MIME_SWITCH;
    }
  }
}

sub urn_error {
  my($code) = @_; #store failure code here...

  print "Status: $code";
  print "Content-type: text/html\n\n<HTML>\n";
  print "<head><title>URN Resolution: I2L $code</title></head>\n";
  print "<BODY>\n";
  print "<h1>URN to URL resolution failed for the URN:</h1>\n";
  print "<hr><h3>$urn</h3>\n";
  print "</body>\n";
  print "</html>\n";
  exit;
}

sub resolveid {
  my($flag,@bib,$i,$k,$j,$done,@ref);
  my($l,$link);
  my($value) = @_;
  my($scheme) = "id";
  $scheme =~ tr/A-Z/a-z/;
  &urn_error("404 Not Found\n")if (!defined $pathbase{$scheme});
  my($try)="/ftp/$pathbase{$scheme}$value.txt";
  if (-f $try) {
    push(@urls, "http://$host/$pathbase{$scheme}$value.txt");
    push(@urls, "ftp://$host/$pathbase{$scheme}$value.txt");
    push(@urls, "gopher://$host:70/0/$pathbase{$scheme}$value.txt");
  }
  $try="/ftp/$pathbase{$scheme}$value.ps";
  if (-f $try) {
    push(@urls, "http://$host/$pathbase{$scheme}$value.ps");



    push(@urls, "ftp://$host/$pathbase{$scheme}$value.ps");
    push(@urls, "gopher://$host:70/0/$pathbase{$scheme}$value.ps");
  }
  $try="/ftp/$pathbase{$scheme}$value.html";
  if (-f $try) {
    push(@urls, "http://$host/$pathbase{$scheme}$value.html");
    push(@urls, "ftp://$host/$pathbase{$scheme}$value.html");
  }

  &urn_error("404 Not Found\n") if ($#urls == -1);

MIME_SWITCH: {
    if ($accept =~ /text\/uri-list/) { #look for text/uri-list,
        otherwise text/html
      print "Status: 200 OK\n";
      print "Content-type: text/uri-list\n\n\n";
      print "#$urn\n";
      foreach $i (@urls) {
        print "$i\n";
      }
      last MIME_SWITCH;
    }
    if ($accept =~ /\*\/\*|text\/html/) {
      print "Status: 200 OK\n";
      print "Content-type: text/html\n\n<HTML>\n";
      print "<head><title>URN Resolution: I2Ls</title></head>\n";
      print "<BODY>\n";
      print "<h1>URN $urn resolves to the following URLs:</h1>\n";
      print "<hr><ul>\n";
      foreach $i (@urls) {
        print "<LI><A HREF=\"$i\">$i</A>\n";
      }
      print "</UL>\n</body>\n</HTML>\n";
      last MIME_SWITCH;
    }
  }
}


