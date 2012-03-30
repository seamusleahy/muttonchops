(function(undefined) {
  
  var root = this;
  
  // Console debugging;
  var console = {};
  var consoleMethods = ['log', 'warn', 'error'];
  var DEBUG = true;
  if(DEBUG) {
    for(var i=0; i<consoleMethods.length; ++i) {
      (function(name) {
        console[name] = function() {
          if(root.console && root.console[name]) {
            return root.console[name].apply(root.console, arguments);
          }
        };
      })(consoleMethods[i]);
    }
  } else {
    for(var i=0; i<consoleMethods.length; ++i) {
      console[consoleMethods[i]] = function() {};
    }
  }
  
  
  
  // Public exposed API
  root.muttonchops = {};
  
  
  /**
   * Make a template function
   *
   * @param templateString string - the templateString
   *
   * @return function - the function to execute to run the template
   */
  root.muttonchops.make = function(templateString) {
    var template = new Template(templateString);
    
    var ret = function(data) {
      return template.execute(data);
    };
    
    ret.templateString = templateString;
    ret.template = template;
    
    return ret;
  };
  
  
  /**
   * Register a filter
   *
   * @param name string - the filter name
   * @param fn function(name [, arg]*) - the function to be called to process the filter
   */
  root.muttonchops.registerFilter = function(name, fn) {
    allFilters[name] = fn;
  };
  
  
  /**
   * Register a tag
   *
   * @param name string - the tag name
   * @param handler function(name) or object - the function to be called to process a tag
   */
  root.muttonchops.registerTag = function(name, handler) {
    if (_.isFunction(handler)) {
      allTags[name] = {execute: handler};
      
    } else if (_.isObject(handler) && handler.execute && _.isFunction(handler.execute)) {
      allTags[name] = handler;
    }
    
  };
  
  
  
  
  // Core class object based on John Resig's code
  (function() {
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    var Class = root.muttonchops.Class = function(){};
    
    var registeredClasses = {};
    
    // Serialize function
    var serialize = function(obj) {
      if(_.isArray(obj)) {
        var serialized = [];
        
        for(var i=0; i<obj.length; ++i) {
          if(_.isFunction(obj[i])) {
            // do nothing for functions
          
          } else if(_.isArray(obj[i])) {
            serialized.push( serialize(obj[i]) );
            
          } else if(_.isObject(obj[i]) && obj[i].serialize) {
            serialized.push( obj[i].serialize() );
            
          } else if(_.isObject(obj[name])) {
            serialized.push( serialize(obj[i]) );
            
          } else {
            serialized.push( obj[i] );
          }
        }
        
        return serialized;
        
      } else if(_.isObject(obj)) {
        var serialized = {};
        for(var name in obj) {
          if(obj._meta && obj._meta.ignoreProps && obj._meta.ignoreProps.indexOf(name) != -1) {
            // do nothing
            
          } else if(name == 'Class') {
            // do nothing for the base class
            
          } else if(_.isFunction(obj[name])) {
            // do nothing for functions
          
          } else if(_.isArray(obj[name])) {
            serialized[name] = serialize(obj[name]);
            
          } else if(_.isObject(obj[name]) && obj[name].serialize) {
            serialized[name] = obj[name].serialize();
            
          } else if(_.isObject(obj[name])) {
            serialized[name] = serialize(obj[name]);
            
          } else {
            serialized[name] = obj[name];
          }
        }
        
        return serialized;
      }
      
      return null;
    }
    
    
    
    /**
     * Pass a JSON object (that has already been parsed if it is a string)
     * to unserialize into a class
     */
    var unserialize = function(obj, refs) {
      refs = _.clone( refs || {} );
      
      if(_.isArray(obj)) {
        var a = [];
        
        _.each(obj, function(elem) {
          a.push( unserialize(elem, refs) );
        });
        
        return a;
      } else if(_.isObject(obj) && obj._meta && obj._meta.className && registeredClasses[obj._meta.className]) {
        initializing = true;
        var c = new registeredClasses[obj._meta.className]();
        initializing = false;
        c._meta = obj._meta;
        
        if(c._unserializePreInit) {
          c._unserializePreInit(refs);
        }
        
        _.each(obj, function(val, key) {
          if(!c[key]) {
            c[key] = unserialize(val, refs);
          }
        });
        
        if(c._unserializeInit) {
          c._unserializeInit();
        }
        
        return c;
        
      } else if(_.isObject(obj)) {
        var o = {};
        
        _.each(obj, function(val, key) {
          o[key] = unserialize(val, refs);
        });
        
        return o;
      } else {
        return obj;
      }
    };
    
    
    
    // Create a new Class that inherits from this class
    Class.extend = function(klassName, prop, classProps, ignoreProps) {
      var _super = this.prototype;
      
      // Instantiate a base class (but only create the instance,
      // don't run the init constructor)
      initializing = true;
      var prototype = new this();
      initializing = false;
      
      
      // Serialization and unserialization      
      prototype.serialize = function() {
        return serialize(this);
      };
      
      
      // Copy the properties over onto the new prototype
      for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" && 
          typeof _super[name] == "function" && fnTest.test(prop[name]) ?
          (function(name, fn){
            return function() {
              var tmp = this._super;
              
              // Add a new ._super() method that is the same method
              // but on the super-class
              this._super = _super[name];
              
              // The method only need to be bound temporarily, so we
              // remove it when we're done executing
              var ret = fn.apply(this, arguments);        
              this._super = tmp;
              
              return ret;
            };
          })(name, prop[name]) :
          prop[name];
      }
      
      
      // The dummy class constructor
      function Class() {
        // All construction is actually done in the init method
        if ( !initializing && this.init )
          this.init.apply(this, arguments);
      }
      
      // Class props
      if(classProps) {
        for (var name in classProps) {
          Class[name] = classProps[name];
        }
      }
      
      Class._unserialize = unserialize;
      registeredClasses[klassName] = Class;
      
      // Populate our constructed prototype object
      Class.prototype = prototype;
      
      // Store the class name
      var meta = {'className': klassName};
      
      meta.ignoreProps = _.union( (prototype._meta && prototype._meta.ignoreProps ? prototype._meta.ignoreProps : []),  (ignoreProps || []) );
      
      Class.prototype._meta = meta;
      
      
      // Enforce the constructor to be what we expect
      Class.prototype.constructor = Class;
  
      // And make this class extendable
      Class.extend = arguments.callee;
      
      
      return Class;
    };
  })();
  
  var Class = root.muttonchops.Class;
  
  
  
  
  // Internal variables
  var allFilters = {};
  var allTags = {};
  
  
  
  /**
   * Template Class
   *
   * Takes a string to render into a template and then process.
   */
  var Template = Class.extend('Template', {
    /**
     * constructor
     *
     * @param templateString string - the template to processes
     */
    init: function(templateString) {
      this.env = new Environment();
      this.parseList = new ParseList();
      this.parseList.parse(templateString, this.env);
    },
    
    _unserializePreInit: function(refs) {
      refs.env = this.env = new Environment();
    },
    
    
    /**
     * Execute the template into output
     *
     * @param data object - the data to use in the rendering
     *
     * @return string - the rendered output
     */
    execute: function(data) {
      this.env.reset(data);
      this.parseList.run();
      return this.env.output;
    }
  }, {}, ['env']);
  
  
  
  /**
   * The environment during the rendering
   *
   */
  var Environment = Class.extend('Environment', {
    init: function() {
      this.data = {};
      this.output = '';
    },
    
    _unserializePreInit: function(refs) {
      this.init();
    },
    
    /**
     * Add to the output
     *
     * @param s string - the content to add to the end of the output
     */
    print: function(s) {
      this.output += s;
    },
    
    /**
     * Reset the environment to have new data and reset output
     *
     * @param data object - the data
     */
    reset: function(data) {
      this.data = data || {};
      this.output = '';
    },
    
    /**
     * Get the value of a variable
     *
     * @param variable string - a string name of a variable
     *
     * @return the value that matches the variable string or null
     */
    getValue: function(variable) {
      var parts = variable.split('.');
      var p = this.data;
      
      for(var i=0; i<parts.length; ++i) {
        if(p[parts[i]] != null) {
          if(_.isFunction(p[parts[i]])) {
            p = p[parts[i]].call(p);
          } else {
            p = p[parts[i]];
          }
        } else {
          return null;
        }
      }
      
      return p;
    }
  }, {}, ['data', 'output']);
  
  
  /**
   * ParseList
   */
  var ParseList = root.muttonchops.ParseList = Class.extend('ParseList', {
    init: function() {
      this.list = [];
      this.position = 0;
    },
    
    _unserializePreInit: function(refs) {
      refs.parseList = this;
      this.position = 0;
    },
    
    /**
     * Set the list of tokens
     *
     * @param list array - an array of tokens
     */
    setList: function(list) {
      this.list = list;
      this.position = 0;
    },
    
    
    /**
     * Check if at end
     *
     * @return true if at or past the end, otherwise, true
     */
    end: function() {
      return this.position >= this.list.length;
    },
    
    
    /**
     * Advance to the next token
     *
     * @return the next token
     */
    next: function() {
      if(this.end()) {
        return null;
      }
      
      return this.list[++this.position];
    },
    
    
    /**
     * Peek at the next token
     *
     * @return the next token
     */
    peek: function() {
      if(this.end()) {
        return null;
      }
      
      return this.list[this.position];
    },
    
    /**
     * Rewind to a particular token
     *
     * @param token Token - the token to rewind the list to
     */
    rewindTo: function(token) {
      while(this.position >= 0 && this.list[this.position] != token) { 
        this.position--;
      }
      
      if(this.position < 0) {
        this.position = 0;
      }
      
      return this.list[this.position]
    },
    
    /**
     * Start running through the list of tokens
     */
    run: function() {
      var t = this.list[this.position];
      while(!this.end()) {
        if(t.exec) {
          t.exec();
        }
        t = this.next();
      }
    },
    
    /**
     * Parse a template string
     *
     * @param templateString string - the template
     * @param env Environment - the environment object to use
     */
    parse: function(templateString, env) {
      var matches = templateString.match(/{{([^}]|}[^}])*}}|{%([^%]|%[^}])*%}|([^{]|{[^{%])+/g);
      
      var printRe = /^{{\s*(.*?)\s*}}$/;
      var tagRe = /^{%\s*(.*?)\s*%}$/;
      
      var tokens = [];
      var m;
      
      for(var i=0; i<matches.length; ++i) {
        if((m=matches[i].match(printRe))) {
          tokens.push(new PrintToken(m[1], env, this));
        } else if((m=matches[i].match(tagRe))) {
          tokens.push(new TagToken(m[1], env, this));
        } else {
          tokens.push(new TextToken(matches[i], env, this));
        }
      }
      
      this.setList(tokens);
    }
  }, {}, ['position']);
  

   
   
  
  /**
   * Base Token class
   */
  var Token = Class.extend('Token', {
    init: function(value, env, parseList) {
      this.value = value;
      this.env = env;
      this.parseList = parseList;
      this.isPreprocessed = false;
      
      if(this.setup) {
        this.setup();
      }
    },
    
    _unserializePreInit: function(refs) {
      this.env = refs.env;
      this.parseList = refs.parseList;
    },
    
    type: 'token',
    
    preprocess: function() {
      if(!this.isPreprocessed) {
        this.isPreprocessed = true;
      }
    },
    
    exec: function() {
      this.preprocess();
      if(this.value != null) {
        this.env.print(this.value);
      }
    }
  }, {}, ['env', 'parseList']);
  
  
  /**
   * Text token
   */
  var TextToken = Token.extend('TextToken', {
    type: 'text',
  });
  
  
  
  /**
   * Print token
   *
   * {{ }}
   */
  var PrintToken = Token.extend('PrintToken', {
    type: 'print',
    
    setup: function() {
      this.valueEval = new ValueWithFilters(this.value);
    },
    
    exec: function() {
      this.preprocess();
      var v = this.valueEval.evaluate(this.env);
      if(v != null) {
        this.env.print(v);
      }
    }
  });
  
  
  
  /**
   * Tag token
   *
   * {% %}
   */
  var TagToken = Token.extend('TagToken', {
    type: 'tag',
    
    setup: function() {
      var parts = this.value.match(/("[^"]*"|'[^']*'|\S+)+/g);
      this.name = parts[0];
      this.parts = parts.slice(1);
    },
    
    exec: function() {
      this.preprocess();
      if(allTags[this.name]) {
        allTags[this.name].execute.call(this);
      }
    },
    
    preprocess: function() {
      if(!this.isPreprocessed) {
        this.isPreprocessed = true;
        
        if(allTags[this.name].preprocess) {
          allTags[this.name].preprocess.call(this);
        }
      }
    },
  });
  
  
  
  /**
   * Handle a value and any filters attached to it
   */
  var ValueWithFilters = Class.extend('ValueWithFilters', {
    init: function(value) {
      var parts = value.split('|');
      this.variable = parts[0];
      
      parts = parts.slice(1); // remove the variable from the filters
      
      var filters = this.filters = [];
      
      _.each(parts, function(v) {
        var r = {};
        filters.push(r);
        
        // split the filter name from the args
        var m = v.match(/(\w+)(:(.*))?/);
        r.name = m[1];
        r.args = [];
        
        // Go through the args
        if(m[3]) {
          var args = m[3].match(/"[^"]*"|'[^']*'|[^\s,]+/g);
          _.each(args, function(v) {
            if(v.match(/^['"].*['"]$/)) {
              v = v.substr(1, v.length-2);
            } else if((n = _.string.toNumber(v)) && !isNaN(n)) {
              v = n;
            }
            r.args.push(v);
          });
        }
      });
    },
    
    /**
     * Get the evaluated value from the environment and applying any filters
     *
     * @param env Environment - the environment to pull the variable from
     *
     * @return value
     */
    evaluate: function(env) {
      // get the value
      var v = env.getValue(this.variable);
      
      // apply the filters
      for(var i=0; i<this.filters.length; ++i) {
        var f = this.filters[i];
        if(allFilters[f.name]) {
          var args = [v].concat(f.args);
          v = allFilters[f.name].apply(root, args);
        }
      }
      
      return v;
    }
  });

})();