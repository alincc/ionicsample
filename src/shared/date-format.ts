export function date(format, timestamp) {
  //  discuss at: http://locutus.io/php/date/
  // original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
  // original by: gettimeofday
  //    parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: MeEtc (http://yass.meetcweb.com)
  // improved by: Brad Touesnard
  // improved by: Tim Wiel
  // improved by: Bryan Elliott
  // improved by: David Randall
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Thomas Beaucourt (http://www.webapp.fr)
  // improved by: JT
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Rafał Kukawski (http://blog.kukawski.pl)
  // improved by: Theriault (https://github.com/Theriault)
  //    input by: Brett Zamir (http://brett-zamir.me)
  //    input by: majak
  //    input by: Alex
  //    input by: Martin
  //    input by: Alex Wilson
  //    input by: Haravikk
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: majak
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: omid (http://locutus.io/php/380:380#comment_137122)
  // bugfixed by: Chris (http://www.devotis.nl/)
  //      note 1: Uses global: locutus to store the default timezone
  //      note 1: Although the function potentially allows timezone info
  //      note 1: (see notes), it currently does not set
  //      note 1: per a timezone specified by date_default_timezone_set(). Implementers might use
  //      note 1: $locutus.currentTimezoneOffset and
  //      note 1: $locutus.currentTimezoneDST set by that function
  //      note 1: in order to adjust the dates in this function
  //      note 1: (or our other date functions!) accordingly
  //   example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400)
  //   returns 1: '07:09:40 m is month'
  //   example 2: date('F j, Y, g:i a', 1062462400)
  //   returns 2: 'September 2, 2003, 12:26 am'
  //   example 3: date('Y W o', 1062462400)
  //   returns 3: '2003 36 2003'
  //   example 4: var $x = date('Y m d', (new Date()).getTime() / 1000)
  //   example 4: $x = $x + ''
  //   example 4: var $result = $x.length // 2009 01 09
  //   returns 4: 10
  //   example 5: date('W', 1104534000)
  //   returns 5: '52'
  //   example 6: date('B t', 1104534000)
  //   returns 6: '999 31'
  //   example 7: date('W U', 1293750000.82); // 2010-12-31
  //   returns 7: '52 1293750000'
  //   example 8: date('W', 1293836400); // 2011-01-01
  //   returns 8: '52'
  //   example 9: date('W Y-m-d', 1293974054); // 2011-01-02
  //   returns 9: '52 2011-01-02'
  //        test: skip-1 skip-2 skip-5
  let jsdate, f;
  // Keep this here (works, but for code commented-out below for file size reasons)
  // let tal= [];
  let txtWords = [
    'Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  // trailing backslash -> (dropped)
  // a backslash followed by any character (including backslash) -> the character
  // empty string -> empty string
  let formatChr = /\\?(.?)/gi;
  let formatChrCb = (t, s) => {
    return f[t] ? f[t]() : s
  };
  let _pad = (n, c) => {
    n = String(n);
    while (n.length < c) {
      n = '0' + n;
    }
    return n;
  };
  f = {
    // Day
    d: () => {
      // Day of month w/leading 0; 01..31
      return _pad(f.j(), 2);
    },
    D: () => {
      // Shorthand day name; Mon...Sun
      return f.l().slice(0, 3);
    },
    j: () => {
      // Day of month; 1..31
      return jsdate.getDate();
    },
    l: () => {
      // Full day name; Monday...Sunday
      return txtWords[f.w()] + 'day';
    },
    N: () => {
      // ISO-8601 day of week; 1[Mon]..7[Sun]
      return f.w() || 7;
    },
    S: () => {
      // Ordinal suffix for day of month; st, nd, rd, th
      let j = f.j();
      let i = j % 10;
      if (i <= 3 && parseInt(((j % 100) / 10).toString(), 10) === 1) {
        i = 0;
      }
      return ['st', 'nd', 'rd'][i - 1] || 'th';
    },
    w: () => {
      // Day of week; 0[Sun]..6[Sat]
      return jsdate.getDay();
    },
    z: () => {
      // Day of year; 0..365
      let a = new Date(f.Y(), f.n() - 1, f.j());
      let b = new Date(f.Y(), 0, 1);
      return Math.round((a.getTime() - b.getTime()) / 864e5);
    },
    // Week
    W: () => {
      // ISO-8601 week number
      let a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3);
      let b = new Date(a.getFullYear(), 0, 4);
      return _pad(1 + Math.round((a.getTime() - b.getTime()) / 864e5 / 7), 2);
    },
    // Month
    F: () => {
      // Full month name; January...December
      return txtWords[6 + f.n()];
    },
    m: () => {
      // Month w/leading 0; 01...12
      return _pad(f.n(), 2);
    },
    M: () => {
      // Shorthand month name; Jan...Dec
      return f.F().slice(0, 3);
    },
    n: () => {
      // Month; 1...12
      return jsdate.getMonth() + 1;
    },
    t: () => {
      // Days in month; 28...31
      return (new Date(f.Y(), f.n(), 0)).getDate();
    },
    // Year
    L: () => {
      // Is leap year?; 0 or 1
      let j = f.Y();
      return j % 4 === 0 && j % 100 !== 0 || j % 400 === 0;
    },
    o: () => {
      // ISO-8601 year
      let n = f.n();
      let W = f.W();
      let Y = f.Y();
      return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
    },
    Y: () => {
      // Full year; e.g. 1980...2010
      return jsdate.getFullYear();
    },
    y: () => {
      // Last two digits of year; 00...99
      return f.Y().toString().slice(-2);
    },
    // Time
    a: () => {
      // am or pm
      return jsdate.getHours() > 11 ? 'pm' : 'am';
    },
    A: () => {
      // AM or PM
      return f.a().toUpperCase();
    },
    B: () => {
      // Swatch Internet time; 000..999
      let H = jsdate.getUTCHours() * 36e2;
      // Hours
      let i = jsdate.getUTCMinutes() * 60;
      // Minutes
      // Seconds
      let s = jsdate.getUTCSeconds();
      return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
    },
    g: () => {
      // 12-Hours; 1..12
      return f.G() % 12 || 12;
    },
    G: () => {
      // 24-Hours; 0..23
      return jsdate.getHours();
    },
    h: () => {
      // 12-Hours w/leading 0; 01..12
      return _pad(f.g(), 2);
    },
    H: () => {
      // 24-Hours w/leading 0; 00..23
      return _pad(f.G(), 2);
    },
    i: () => {
      // Minutes w/leading 0; 00..59
      return _pad(jsdate.getMinutes(), 2);
    },
    s: () => {
      // Seconds w/leading 0; 00..59
      return _pad(jsdate.getSeconds(), 2);
    },
    u: () => {
      // Microseconds; 000000-999000
      return _pad(jsdate.getMilliseconds() * 1000, 6);
    },
    // Timezone
    e: () => {
      // Timezone identifier; e.g. Atlantic/Azores, ...
      // The following works, but requires inclusion of the very large
      // timezone_abbreviations_list() function.
      /*              return that.date_default_timezone_get();
       */
      let msg = 'Not supported (see source code of date() for timezone on how to add support)';
      throw new Error(msg);
    },
    I: () => {
      // DST observed?; 0 or 1
      // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
      // If they are not equal, then DST is observed.
      let a = new Date(f.Y(), 0);
      // Jan 1
      let c = Date.UTC(f.Y(), 0);
      // Jan 1 UTC
      let b = new Date(f.Y(), 6);
      // Jul 1
      // Jul 1 UTC
      let d = Date.UTC(f.Y(), 6);
      return ((a.getTime() - c) !== (b.getTime() - d)) ? 1 : 0;
    },
    O: () => {
      // Difference to GMT in hour format; e.g. +0200
      let tzo = jsdate.getTimezoneOffset();
      let a = Math.abs(tzo);
      return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
    },
    P: () => {
      // Difference to GMT w/colon; e.g. +02:00
      let O = f.O();
      return (O.substr(0, 3) + ':' + O.substr(3, 2));
    },
    T: () => {
      // The following works, but requires inclusion of the very
      // large timezone_abbreviations_list() function.
      /*              let abbr, i, os, _default;
       if (!tal.length) {
       tal = that.timezone_abbreviations_list();
       }
       if ($locutus && $locutus.default_timezone) {
       _default = $locutus.default_timezone;
       for (abbr in tal) {
       for (i = 0; i < tal[abbr].length; i++) {
       if (tal[abbr][i].timezone_id === _default) {
       return abbr.toUpperCase();
       }
       }
       }
       }
       for (abbr in tal) {
       for (i = 0; i < tal[abbr].length; i++) {
       os = -jsdate.getTimezoneOffset() * 60;
       if (tal[abbr][i].offset === os) {
       return abbr.toUpperCase();
       }
       }
       }
       */
      return 'UTC';
    },
    Z: () => {
      // Timezone offset in seconds (-43200...50400)
      return -jsdate.getTimezoneOffset() * 60;
    },
    // Full Date/Time
    c: () => {
      // ISO-8601 date.
      return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
    },
    r: () => {
      // RFC 2822
      return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
    },
    U: () => {
      // Seconds since UNIX epoch
      return jsdate / 1000 | 0;
    }
  }
  let _date = function (format, timestamp) {
    jsdate = (timestamp === undefined ? new Date() // Not provided
        : (timestamp instanceof Date) ? new Date(timestamp) // JS Date()
          : new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
    );
    return format.replace(formatChr, formatChrCb);
  }
  return _date(format, timestamp);
}

