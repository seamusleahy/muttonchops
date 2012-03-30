(function(undefined) {

  /**
   * Branching: if/unless/elseif/else
   */
  var branching = function() {
    if(!this.statementTest) {
      this.statementTest = booleanStatementParser(this.parts[0]);
    }
    var test = this.statementTest(this.env);
    
    var doIt = test;
    if(this.name == 'unless') {
      doIt = !doIt;
    }
    var executed = doIt;
    
    var token = this.parseList.next();
    while(token && (token.type != 'tag' || token.name != 'endif')) {
      // Elseif - when previous block has not run
      if(token.type == 'tag' && token.name == 'elseif' && !executed) {
        if(!token.statementTest) {
          token.statementTest = booleanStatementParser(token.parts[0]);
        }
        if(token.statementTest(this.env)) {
          executed = true;
          doIt = true;
        } else {
          doIt = false;
        }
        
      // Else - when a previous block has not run
      } else if(token.type == 'tag' && token.name == 'else' && !executed) {
        doIt = true;
        executed = true;
        
      // Else & Endif - when a previous block has run
      } else if(token.type == 'tag' && (token.name == 'else' || token.name != 'endif')) {
        doIt = false;
      
      // Any other token when we are in the active block
      } else if(doIt) {
        token.exec();
      }
      
      token = this.parseList.next();
    }
    
  };
  
  muttonchops.registerTag('if', branching);
  muttonchops.registerTag('unless', branching);
  
  /**
   * Parse the if/unless/elseif boolean statement
   */
  var booleanStatementParser = function(value) {
    // TODO support boolean statements with 'and', 'or', 'xor', comparisons, and parens
      
      return function(env) {
        return env.getValue(value);
      }
    
    // var tokens = {
//       'and': /and/,
//       'or': /or/,
//       'eq': /==/,
//       'ne': /!=/,
//       'gt': />/,
//       'gte': />=/,
//       'lt': /</,
//       'lte': /<=/,
//       'number': /\d+(\.\d*)?/,
//       'string': /"[^"]*"|'[^']*'/,
//       'var': /[\w]+(\.[\w]+)*/
//     };
//     
//     var rules = {
//       'Start':   [['And']],
//       'And':     [['Or', 'and', 'And'], ['Or']],
//       'Or':      [['Compare', 'or', 'Or'], ['Compare']],
//       'Compare': [['V', 'lte', 'V'], ['V', 'lt', 'V'], ['V', 'gte', 'V'], ['V', 'gt', 'V'], ['V', 'eq', 'V'], ['V', 'ne', 'V']]
//     };
  };
  
  
  /**
   * ForLoop control iterator
   * 
   * Provides the iterator logic and template variables
   */
  var ForLoop = muttonchops.Class.extend('ForLoop', {
    init: function(variable, args, env, parentloop) {
      this._collection = env.getValue(variable);
      this._type = _.isArray(this._collection) ? 'array' : _.isObject(this._collection) ? 'object' : 'other';
      if(this._type == 'object') {
        this._keys = _.keys(this._collection);
      }
      this._args = args;
      this._cur = -1;
      this._length = this._type=='other' ? 0 : _.size(this._collection);
      
      this.parentloop = parentloop;
      this._env = env;
      this._env.data.forloop = this;
    },
    
    counter: function() {
      return this._cur+1;
    },
    
    counter0: function() {
      return this._cur;
    },
    
    revcounter: function() {
      return this._length - this._cur;
    },
    
    revcounter0: function() {
      return this._length - this._cur - 1;
    },
    
    first: function() {
      return this._cur == 0;
    },
    
    last: function() {
      return this._length - 1 == this._cur;
    },
    
    // Internal usage
    next: function() {
      this._cur = this._cur+1;
      if(this._cur >= this._length) {
        this._env.data.forloop = this.parentloop;
        return false;
      }
      
      if(this._type == 'array') {
        var value = this._collection[this._cur];
        if(_.isArray(value) && this._args.length > 1) {
          for(var i=0; i<this._args.length && i<value.length; ++i) {
            this._env.data[this._args[i]] = value[i];
          }
        } else {
          this._env.data[this._args[0]] = value;
        }
        
      } else {
        var key = this._keys[this._cur];
        var value = this._collection[key];
        
        if(this._args.length > 2 && _.isArray(value)) {
          this._env.data[this._args[0]] = key;
          for(var i=0; i<this._args.length-1 && i<value.length; ++i) {
            this._env.data[this._args[i+1]] = value[i];
          }
          
        } else if(this._args.length == 1) {
          this._env.data[this._args[0]] = value;
          
        } else {
          this._env.data[this._args[0]] = key;
          this._env.data[this._args[1]] = value;
        }
      }
      
      
      return true;
    }
  });
  
  /**
   * for tag
   */
  muttonchops.registerTag('for', {
    preprocess: function() {
      this.variable = _.last(this.parts);
      this.args = this.parts.slice(0, this.parts.length-2).join('').split(',');
    },
    
    execute: function() {
      this.variable = _.last(this.parts);
      this.args = this.parts.slice(0, this.parts.length-2).join('').split(',');
      
      var forloop = new ForLoop(this.variable, this.args, this.env, this.env.getValue('forloop'));
      
      while(forloop.next()) {
        this.parseList.rewindTo(this);
        var token = this.parseList.next();
        
        while(token && (token.type != 'tag' || token.name != 'endfor')) {
          token.exec();
          token = this.parseList.next();
        }
      }
      
      // move to after the endfor
      if(forloop._length == 0) {
        var token = this.parseList.next();
        while(token && (token.type != 'tag' || token.name != 'endfor')) {
          token = this.parseList.next();
        }
      }
    }
  });

})();