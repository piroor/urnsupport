#!/usr/local/bin/perl

use strict;

#
# this is a URN 2 resource resolver for the ietf namespace
#

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

print "$urn\n";
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
      print "Status:  200 OK\n";
      print "Content-type: text/plain\n\n";
      open(FILE, "$link");
      while (<FILE>) {
          print $_;
      }
      close FILE;
    return;
  }
  my($link)="$wgpath/$date/$sesnam-minutes-$date.txt";
  if (-f $link) {
      print "Status:  200 OK\n";
      print "Content-type: text/plain\n\n";
      open(FILE, "$link");
      while (<FILE>) {
          print $_;
      }
      close FILE;
    return;
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
  &urn_error("404 Not Found\n")if (!defined $pathbase{$scheme});
  my($txttry)="/ftp/$pathbase{$scheme}$value.txt";
  my($pstry)="/ftp/$pathbase{$scheme}$value.ps";
  my($htmltry)="/ftp/$pathbase{$scheme}$value.html";
MIME_SWITCH: {
    if ($accept =~ /application\/postscript/ && -f $pstry) {
      print "Status:  200 OK\n";
      print "Content-type: application/postscript\n\n";
      open(FILE, "$pstry");
      while (<FILE>) {
          print $_;
      }
      close FILE;
      last MIME_SWITCH;
    }
    if ($accept =~ /text\/html/ && -f $htmltry) {
        print "Status:  200 OK\n";
        print "Content-type: text/html\n\n";
        open(FILE, "$htmltry");
        while (<FILE>) {
            print $_;
        }
        close FILE;
        last MIME_SWITCH;
    }
    if ($accept =~ /\*\/\*|text\/plain/ && -f $txttry) {
        print "Status:  200 OK\n";
        print "Content-type: text/plain\n\n";
        open(FILE, "$txttry");
        while (<FILE>) {
            print $_;
        }
        close FILE;
        last MIME_SWITCH;
    }



    &urn_error("404 Not Found\n");
  }
}

sub resolveid {
  my($flag,@bib,$i,$k,$j,$done,@ref);
  my($l,$link);
  my($scheme) = "id";
  my($value) = @_;
  $scheme =~ tr/A-Z/a-z/;
  &urn_error("404 Not Found\n")if (!defined $pathbase{$scheme});
  my($txttry)="/ftp/$pathbase{$scheme}$value.txt";
  my($pstry)="/ftp/$pathbase{$scheme}$value.ps";
  my($htmltry)="/ftp/$pathbase{$scheme}$value.html";
MIME_SWITCH: {
    if ($accept =~ /application\/postscript/ && -f $pstry) {
      print "Status:  200 OK\n";
      print "Content-type: application/postscript\n\n";
      open(FILE, "$pstry");
      while (<FILE>) {
          print $_;
      }
      close FILE;
      last MIME_SWITCH;
    }
    if ($accept =~ /text\/html/ && -f $htmltry) {
        print "Status:  200 OK\n";
        print "Content-type: text/html\n\n";
        open(FILE, "$htmltry");
        while (<FILE>) {
            print $_;
        }
        close FILE;
        last MIME_SWITCH;
    }
    if ($accept =~ /\*\/\*|text\/plain/ && -f $txttry) {
        print "Status:  200 OK\n";
        print "Content-type: text/plain\n\n";
        open(FILE, "$txttry");
        while (<FILE>) {
            print $_;
        }
        close FILE;
        last MIME_SWITCH;
    }
    &urn_error("404 Not Found\n");
  }
}


sub urn_error {
  my($code) = @_; #store failure code here...

  print "Status:  $code";
  print "Content-type: text/html\n\n<HTML>\n";
  print "<head><title>URN Resolution: I2R $code</title></head>\n";
  print "<BODY>\n";
  print "<h1>URN to URL resolution failed for the URN:</h1>\n";
  print "<hr><h3>$urn</h3>\n";
  print "</body>\n";
  print "</html>\n";
  exit;
}


