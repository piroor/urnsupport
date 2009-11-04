#!/usr/local/bin/perl

use strict;

#
# this is a URN 2 URC resolver for the ietf namespace
#

my(%cite) = (
  bcp => "/ftp/rfc/bcp-index.txt",
  fyi => "/ftp/fyi/fyi-index.txt",
  id => "/ftp/internet-drafts/1id-abstracts.txt",
  rfc => "/ftp/rfc/rfc-index.txt",
  std => "/ftp/std/std-index.txt"
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
(&resolverfc($1, $2), exit) if ($urn =~ /urn:ietf:(\w*):(\d*)/i);
(&resolvemtg($1, $2), exit) if ($urn =~ /urn:ietf:mtg:(\d*)-(\w*)/i);
&urn_error("400 Bad Request\n");

sub resolvemtg {
  my($ietfnum, $sesnam) = @_;
  &urn_error("404 Not Found\n") if (!defined $number2date{$ietfnum});
  my($date)=$number2date{$ietfnum};


  my($link)="$wgpath/$sesnam/$sesnam-minutes-$date.txt";
  if (-f $link) {
    print "Status:  200 OK\r\n";
    print "Content-type: text/html\r\n\r\n";
    print "<HTML>\n<TITLE>Citation for $urn</TITLE>\n";
    print "<BODY>\n";
    print "<H1><A HREF=\"$link\">$urn</A>:</H1>\n";
    print "Minutes of the $sesnam working group from the "
          . &end($ietfnum) . " IETF";
    print "</BODY>\n</HTML>\n";
    return;
  }
  my($link)="$wgpath/$date/$sesnam-minutes-$date.txt";
  if (-f $link) {
    print "Status:  200 OK\r\n";
    print "Content-type: text/html\r\n\r\n";
    print "<HTML>\n<TITLE>Citation for $urn</TITLE>\n";
    print "<BODY>\n";
    print "<H1><A HREF=\"$link\">$urn</A>:</H1>\n";
    print "Minutes of the $sesnam working group from the "
           . &end($ietfnum) . " IETF";
    print "</BODY>\n</HTML>\n";
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

sub resolverfc {
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

  if ($scheme ne "rfc") {
    print "Status:  200 OK\r\n";
    print "Content-type: text/html\r\n\r\n";
    $bib[0] =~ s/^[0-9]*\s*/<B>/;
    for ($i=0; $i<=$#bib; $i+=1) {
      last if ($bib[$i] =~ s/\./.<\/B>/);
    }
    for ($i=0;$i<=$#bib;$i+=1) {
      $k=$bib[$i];
      while ($k =~ /(fyi|std|rfc|bcp)([0-9]+)(.*)/i) {
        push @ref,"$1$2";
        $k=$3;
      }
      $done="";
      foreach $j (@ref) {
        next if ($done =~ $j);
        $done .= "$j ";
        $l = $j;
        $l =~ tr/A-Z/a-z/;
        $link=&make_link("$l");
        $bib[$i] =~ s/$j/<A HREF="$link">$j<\/A>/g;
      }
    }
    print "<HTML>\n<TITLE>Citation for $urn</TITLE>\n";
    print "<BODY>\n";
    $link=&make_link("$scheme$value");
    print "<H1><A HREF=\"$link\">$scheme$value</A>:</H1>\n";
    foreach $i (@bib) {
      print "$i\n";
    }
    print "</BODY>\n</HTML>\n";
  } else {
    print "Status:  200 OK\r\n";
    print "Content-type: text/html\r\n\r\n";
    $bib[0] =~ s/^[0-9]*\s*//;
    $j=0;
    for ($i=0; $i<=$#bib; $i+=1) {
      $j += ($bib[$i] =~ s/, "/, <B>"/);
      $j += ($bib[$i] =~ s/",/"<\/B>,/);
    }
    for ($i=0;$i<=$#bib;$i+=1) {


      $k=$bib[$i];
      while ($k =~ /(fyi\s|std\s|rfc|bcp)([0-9]+)(.*)/i) {
        push @ref,"$1$2";
        $k=$3;
      }
      $done="";
      foreach $j (@ref) {
        next if ($done =~ $j);
        $done .= "$j ";
        $l = $j;
        $l =~ s/\s//g;
        $l =~ tr/A-Z/a-z/;
        $link=&make_link("$l");
        $bib[$i] =~ s/$j/<A HREF="$link">$j<\/A>/g;
      }
    }
    print "<HTML>\n<TITLE>Citation for $urn</TITLE>\n";
    print "<BODY>\n";
    $link=&make_link("$scheme$value");
    print "<H1><A HREF=\"$link\">$scheme$value</A>:</H1>\n";
    foreach $i (@bib) {
      print "$i\n";
    }
    print "</BODY>\n</HTML>\n";
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

  print "Status:  $code";
  print "Content-type: text/html\n\n<HTML>\n";
  print "<head><title>URN Resolution: I2C $code</title></head>\n";
  print "<BODY>\n";
  print "<h1>URN to URC resolution failed for the URN:</h1>\n";
  print "<hr><h3>$urn</h3>\n";
  print "</body>\n";
  print "</html>\n";
  exit;



};

sub resolveid {
  my($flag,@bib,$i,$k,$j,$count,@ref);
  my($l,$link, $hdr, $done);
  my($value) = @_;
  my($scheme) = "id";

  open(INPUT, "$cite{$scheme}");
  while (<INPUT>) {
#
# capture record
#
    if ($flag == 1 || /^\s+\"/) {
      push @bib,$_;
      ($hdr = -1, $count = 0, $flag = 1) if (/^\s+\"/);
      $count++ if (/^\s+$/);
    }
    if ($count == 1) {
      $hdr = $#bib if ($hdr == -1);
    }
    if ($count == 2) {
      for ($i=0; $i<=$hdr; $i+=1) {
            if ($bib[$i] =~ /<(.*)>/) {
              $l = $1;
              if ($l eq "draft-$value.txt" || $l eq "draft-$value.ps") {
                print "Status:  200 OK\r\n";
                print "Content-type: text/html\r\n\r\n";
                print "<HTML>\n<TITLE>Citation for $urn</TITLE>\n";
                print "<BODY>\n";
                print "<a
href=\"http://blackhole.vip.att.net/internet-drafts/$l\">$l</a>:\n";
                print "<pre>\n";
                foreach $i (@bib) {
                  print "$i";
                }
                print "</pre>\n";
                print "</BODY>\n</HTML>\n";
                exit;
              }
            }
      }
      $flag = 0;
      @bib = ();
    }
  }
  &urn_error("404 Not Found\n");
}

