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
  };

    
  /**
   * Use all the handy underscore string functions as filters
   */
  _.each(_.string, function(fn, name) {
    muttonchops.registerFilter(name, function() {
      return fn.apply(_.string, arguments);
    });
  });
  
  
  // TODO date filter
  
})();