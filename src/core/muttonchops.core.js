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
   * Make a template function from raw input string or serialized template
   *
   * @param templateString string - the templateString
   *
   * @return function - the function to execute to run the template
   */
  root.muttonchops.make = function(templateInput, options) {
    if(_.isObject(templateInput)) {
      var template = Template.unserialize(templateInput, options);
    } else {
      var template = new Template(templateInput, options);
    }
    
    var ret = function(data) {
      return template.execute(data);
    };
    
    //ret.templateString = templateString;
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
    
    // Create a new Class that inherits from this class
    Class.extend = function(prop, classProps) {
      var _super = this.prototype;
      
      // Instantiate a base class (but only create the instance,
      // don't run the init constructor)
      initializing = true;
      var prototype = new this();
      initializing = false;
      
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
      
      // Populate our constructed prototype object
      Class.prototype = prototype;
      
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
  var Template = Class.extend({
    /**
     * constructor
     *
     * @param templateString string - the template to processes
     */
    init: function(templateString, options, serializing) {
      this.options = _.extend({}, {/* default options */}, options || {});
      
      if(!serializing && !_.isArray(templateString)) {
        this.parseList = new ParseList();
        this.parseList.parse(templateString);
      } else {
        this.parseList = ParseList.unserialize(templateString);
      }
      
    },
    
    serialize: function() {
      return this.parseList.serialize(this.options);
    },
    
    
    /**
     * Execute the template into output
     *
     * @param data object - the data to use in the rendering
     *
     * @return string - the rendered output
     */
    execute: function(data, envOptions) {
      var env = new Environment();
      env.reset(data, envOptions);
      this.parseList.reset();
      this.parseList.run(env, this.options);
      return env.output;
    },
    
    executeWithInContext: function(env) {
      this.parseList.reset();
      this.parseList.run(env, this.options);
      return env.output;
    }
  }, {
    
    unserialize: function(src, options) {
      return new Template(src, options, false);
    }
  });
  
  
  
  /**
   * The environment during the rendering
   *
   */
  var Environment = Class.extend({
    init: function() {
      this.data = {};
      this.output = '';
      this.templateLoader = root.muttonchops.defaultTemplateLoader;
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
    reset: function(data, options) {
      options = options || {};
      this.data = data || {};
      this.output = '';
      this.templateLoader = options.templateLoader || root.muttonchops.defaultTemplateLoader;
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
      
      var l = parts.length;
      var i = l;
      var j;
      while(i) {
        j = l - i;
        if(p[parts[j]] != null) {
          if(_.isFunction(p[parts[j]])) {
            p = p[parts[j]].call(p);
          } else {
            p = p[parts[j]];
          }
        } else {
          return null;
        }
        
        --i;
      }

      return p;
    }
  });
  
  
  /**
   * ParseList
   */
  var ParseList = root.muttonchops.ParseList = Class.extend({
    init: function() {
      this.list = [];
      this.position = 0;
      this.length = 0;
    },
    
    serialize: function(options) {
      var list = [];
      
      var p = this.position;
      var l = this.list.length;
      for(var i=0; i<l; ++i) {
        this.position = i;
        this.preprocessToken(this.list[i]);
        list.push(this.list[i]);
      }
      
      this.position = p;
      
      return list;
    },
    
    /**
     * Set the list of tokens
     *
     * @param list array - an array of tokens
     */
    setList: function(list) {
      this.list = list;
      this.length = this.list.length;
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
    rewindTo: function(to) {
      if(_.isNumber(to)) {
        this.position = to;
      } else {
        while(this.position >= 0 && this.list[this.position] != to) { 
          --this.position;
        }
      }
      
      this.position = Math.min( Math.max( this.position, 0 ), this.list.length-1 );
      
      return this.list[this.position];
    },
    
    /**
     *
     */
    forwardTo: function(to) {
      if(_.isNumber(to)) {
        this.position = to;
      } else {
        while(this.position < this.list.length && this.list[this.position] != to) { 
          ++this.position;
        }  
      }      
      return this.list[this.position];
    },
    
    /**
     * Start running through the list of tokens
     */
    run: function(env, options) {
      this.env = env;
      this.options = options;
      var t = this.list[this.position];
      while(!this.end() && t) {
        this.execToken(t);
        t = this.next();
      }
    },
    
    reset: function() {
      this.position = 0;
    },
    
    get: function(pos) {
      return this.list[pos];
    },
    
    /**
     * Parse a template string
     *
     * @param templateString string - the template
     */
    parse: function(templateString) {
      var matches = templateString.match(/{{([^}]|}[^}])*}}|{%([^%]|%[^}])*%}|([^{]|{[^{%])+/g);
      
      var printRe = /^{{\s*(.*?)\s*}}$/;
      var tagRe = /^{%\s*(.*?)\s*%}$/;
      
      var tokens = [];
      var m;
      
      for(var i=0; i<matches.length; ++i) {
        var tok = {};
        if((m=matches[i].match(printRe))) {
          tok.type = 'print';
        } else if((m=matches[i].match(tagRe))) {
          tok.type = 'tag';
        } else {
          tok.type = 'text';
        }
        TokenTypes[tok.type].init(tok, (m? m[1] : matches[i]));
        tokens.push(tok);
      }
      
      this.setList(tokens);
    },
    
    execToken: function(tok) {
      TokenTypes[tok.type].preprocess(tok, this);
      TokenTypes[tok.type].exec(tok, this);
    },
    
    preprocessToken: function(tok) {
      TokenTypes[tok.type].preprocess(tok, this);
    }
  }, {
  
    unserialize: function(tokens) {
      var parseList = new ParseList();
      parseList.setList(tokens);
      return parseList;
    }
  });
  

  var TokenTypes = {};
  
  /**
   * Text token
   */  
  TokenTypes.text = {
    init: function(tok, value) {
      tok.value = value;
    },
    
    preprocess: function(tok, parseList) {},
    
    exec: function(tok, parseList) {
      parseList.env.print(tok.value);
    }
  };
  
  
  /**
   * Print token
   *
   * {{ }}
   */

  TokenTypes.print = {
    init: function(tok, value) {
      if(!tok.valueEval) {
        tok.valueEval = valueWithFilters.parse(value);
      }
    },
    
    preprocess: function(tok, parseList) {},
    
    exec: function(tok, parseList) {
      var v = valueWithFilters.evaluate(tok.valueEval, parseList.env);
      if(v != null) {
        parseList.env.print(v);
      }
    }
  };
  
  
  /**
   * Tag token
   *
   * {% %}
   */
  
  TokenTypes.tag = {
    init: function(tok, value) {
      if(!tok.name) {
        var parts = value.match(/("[^"]*"|'[^']*'|\S+)+/g);
        tok.name = parts[0];
        tok.parts = parts.slice(1);
      }
    },
    
    preprocess: function(tok, parseList) {
      if(!tok.isPreprocessed) {
        tok.isPreprocessed = true;
      
        if(allTags[tok.name] && allTags[tok.name].preprocess) {
          allTags[tok.name].preprocess.call(this, tok, parseList);
        }
      }
    },
    
    exec: function(tok, parseList) {
      if(allTags[tok.name]) {
        allTags[tok.name].execute.call(this, tok, parseList);
      }
    }
  };
  
  
  /**
   * Handle a value and any filters attached to it
   */
  var valueWithFilters = {
    parse: function(value) {
      var tree = {};
      var parts = value.split('|');
      tree.variable = parts[0];
      
      parts = parts.slice(1); // remove the variable from the filters
      
      var filters = tree.filters = [];
      
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
      
      return tree;
    },
    
    evaluate: function(tree, env) {
      // get the value
      var v = env.getValue(tree.variable);
      
      // apply the filters
      var l = tree.filters.length;
      var filters = tree.filters;
      var i = l;
      while(i) {
        var f = filters[l-i];
        if(allFilters[f.name]) {
          var args = [v].concat(f.args);
          v = allFilters[f.name].apply(root, args);
        }
        --i;
      }
      
      return v;
    }
  };


  
  
  // Template loader
  root.muttonchops.TemplateLoader = Class.extend({
    fetch: function( lookup ) {
      return null;
    }
  });
  
  var RegisterTemplateLoader = root.muttonchops.TemplateLoader.extend({
    init: function() {
      this.templates = {};
    },
    
    register: function(name, source) {
      this.templates[name] = source;
    },
    
    fetch: function( name ) {
      return this.templates[name];
    }
  });
  
  /**
   * The callback for loading external templates within a template
   *
   */
  root.muttonchops.defaultTemplateLoader = new RegisterTemplateLoader();

})();