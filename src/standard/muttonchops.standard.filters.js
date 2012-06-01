(function(undefined) {
  
  /**
   * Use a default value if the value is empty
   */
  muttonchops.registerFilter('default', function(v, d) {
    return v || d;
  });
  
  // Default string methods
  var stringMethods = {
    'charAt'      : 'charAt',
    'replace'     : 'replace',
    'split'       : 'splite',
    'substr'      : 'substr',
    'substring'   : 'substring',
    'lower'       : 'toLowerCase',
    'toLowerCase' : 'toLowerCase',
    'upper'       : 'toUpperCase',
    'toUpperCase' : 'toUpperCase'
  };
  
  // Add default filters
  _.each(stringMethods, function(fn, name) {
    muttonchops.registerFilter(name, function(v) {
      return String.prototype[fn].apply(v, Array.prototype.slice.call(arguments, 1));
    });
  });

    
  /**
   * Use all the handy underscore string functions as filters
   */
  _.each(_.string, function(fn, name) {
    muttonchops.registerFilter(name, function() {
      return fn.apply(_.string, arguments);
    });
  });
  
  
  // TODO date filter
  muttonchops.registerFilter('date', function( d, format ) {
    
    if( !format || !format.length ) {
      return d;
    }
    
    var d = new Date(d);
    var daysOfWeeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var monthsNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    
    var data = {
      year: d.getFullYear(),
      month: d.getMonth()+1,
      day: d.getDate(),
      dayOfWeek: d.getDay(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
      timezone: d.getTimezoneOffset()
    };
    
    format = format + '';
    var output = '';
    var f;
    for( var i=0; i<format.length; ++i ) {
      switch(format[i]) {
        // Day of the month without leading zeros
        case 'j': 
          f = data.day;
          break;
        
        // Day of the month, 2 digits with leading zeros
        case 'd':
          f = _.string.pad(data.day, 2, '0');
          break;
        
        // A textual representation of a day, three letters
        case 'D':
          f = daysOfWeeks[data.dayOfWeek].substr(0,3);
          break;
        
        // A full textual representation of the day of the week
        case 'l':
          f = daysOfWeeks[data.dayOfWeek];
          break;
        
        // day of the week
        case 'N':
          f = data.dayOfWeek == 0 ? 7 : data.dayOfWeek;
          break;
        
        // English ordinal suffix for the day of the month, 2 characters
        case 'S':
          f = data.day > 10 && data.day < 20 ? 'th' : data.day % 10 == 1 ? 'st' : data.day % 10 == 2 ? 'nd' : data.day % 10 == 3 ? 'rd' : 'th';
          break;
        
        // Numeric representation of the day of the week
        case 'w':
          f = data.dayOfWeek;
          break;
        
        // TODO: z
        case 'z':
          f = '';
          break;
          
        // TODO: W
        case 'W':
          f = '';
          break;
        
        // A full textual representation of a month, such as January or March
        case 'F':
          f = monthsNames[data.month - 1];
          break;
        
        // A short textual representation of a month, three letters
        case 'M':
          f = monthsNames[data.month - 1].substr(0,3);
          break;
        
        // Numeric representation of a month, with leading zeros
        case 'm':
          f = _.string.pad(data.month, 2, '0');
          break;
          
        // Numeric representation of a month, without leading zeros
        case 'n':
          f = data.month;
          break;
        
        // TODO: t
        case 't':
          f = '';
          break;
        
        // TODO: L
        case 'L':
          f = '';
          break;
        
        // TODO: o
        case 'o':
          f = '';
          break;
        
        // A full numeric representation of a year, 4 digits
        case 'Y':
          f = data.year;
          break;
        
        // A two digit representation of a year
        case 'y':
          f = (data.year+'').substr(3,2);
          break;
        
        // Lowercase Ante meridiem and Post meridiem
        case 'a':
          f = data.hour < 12 ? 'am' : 'pm';
          break;
        
        // Uppercase Ante meridiem and Post meridiem
        case 'A':
          f = data.hour < 12 ? 'AM' : 'PM';
          break;
        
        // TODO: B
        case 'B':
          f = '';
          break;
        
        // 12-hour format of an hour without leading zeros
        case 'g':
          f = data.hour % 12 == 0 ? 12 : data.hour % 12;
          break;
          
        // 24-hour format of an hour without leading zeros
        case 'G':
          f = data.hour;
          break;
        
        // 12-hour format of an hour without leading zeros
        case 'h':
          f = _.string.pad(data.hour % 12 == 0 ? 12 : data.hour % 12, 2, '0');
          break;
          
        // 24-hour format of an hour without leading zeros
        case 'h':
          f = _.string.pad(data.hour, 2, '0');
          break;
        
        // Minutes with leading zeros
        case 'i':
          f = _.string.pad(data.minute, 2, '0');
          break;
        
        //
        case 's':
          f = _.string.pad(data.second, 2, '0');
          breal;
        
        // TODO: u, e, I, O, P, T, Z, c, r U
        
        default:
          f = format[i];
      }
      
      output += f;
    }
    
    return output;
  });
  
})();