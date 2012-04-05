(function(undefined) {

  /**
   * Branching: if/unless/elseif/else
   */
  var branching = function(tok, parseList) {
    var statementTest = booleanStatementParser(tok.parts[0]);
    
    var test = statementTest(parseList.env);
    
    var doIt = test;
    if(tok.name == 'unless') {
      doIt = !doIt;
    }
    var executed = doIt;
    
    var token = parseList.next();
    while(token && (token.type != 'tag' || token.name != 'endif')) {
      // Elseif - when previous block has not run
      if(token.type == 'tag' && token.name == 'elseif' && !executed) {
        if(!token.statementTest) {
          token.statementTest = booleanStatementParser(token.parts[0]);
        }
        if(statementTest(parseList.env)) {
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
        parseList.execToken(token);
      }
      
      token = parseList.next();
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
  var ForLoop = muttonchops.Class.extend({
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
      if(this.type == 'other') {
        return false;
      }
      
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
    preprocess: function(tok, parseList) {
      tok.variable = _.last(tok.parts);
      tok.args = tok.parts.slice(0, tok.parts.length-2).join('').split(',');
      
      // Find the empty and endfor tags
      tok.forPosition = parseList.position; // for rolling back
      
      var token = parseList.next();
      while(token && (token.type != 'tag' || token.name != 'endfor' )) {
        if(token.type == 'tag') {
          // The empty tag was found, record its position
          if(token.name == 'empty') {
            tok.emptyPosition = parseList.position;
          
          // A nest for loop was found, run its preprocess as not to misidentify this loops tags
          } else if(token.name == 'for') {
            parseList.preprocessToken(token);
            parseList.forwardTo(token.endforPosition);
          }
        }
        
        token = parseList.next();
      }
      tok.endforPosition = parseList.position;
      parseList.rewindTo(tok.forPosition); // revert position
    },
    
    execute: function(tok, parseList) {
      //this.variable = _.last(this.parts);
      //this.args = this.parts.slice(0, this.parts.length-2).join('').split(',');
      
      var forloop = new ForLoop(tok.variable, tok.args, parseList.env, parseList.env.getValue('forloop'));
      
      
      var stopTags = {'endfor':1, 'empty':1};
      while(forloop.next()) {
        parseList.rewindTo(tok.forPosition);
        var token = parseList.next();
        
        while(token && parseList.position < (tok.emptyPosition || tok.endforPosition)) {
          parseList.execToken(token);
          token = parseList.next();
        }
      }
      
      // empty collection: move to empty block
      if(forloop._length == 0 && tok.emptyPosition) {
        parseList.forwardTo(tok.emptyPosition);
        var token = parseList.next();
        while(token && parseList.position < tok.endforPosition) {
          parseList.execToken(token);
          token = parseList.next();
        }
      // non-empty collection: skip over the empty block
      } else {
        parseList.forwardTo(tok.endforPosition);
      }
    }
  });
  
  
  /**
   * include
   */
  muttonchops.registerTag('include', {
    preprocess: function(tok, parseList) {
      if(tok.parts[0]) {
        var m = tok.parts[0].match(/^([a-zA-Z_]\w*(\.[a-zA-Z_]\w*)*)$|^"(.*)"$|^'(.*)'$/);
        
        if(m) {
          tok.location = m[1] || m[2] || m[3];
          tok.isValue = !!(m[1]);
        }
      }
    },
    execute: function(tok, parseList) {
      if(tok.location) {
        
        var loc = tok.location;
        if(tok.isValue) {
          loc = parseList.env.getValue(loc);
        }
        
        var includedTemplate = parseList.env.templateLoader.fetch(loc);
        if(includedTemplate) {
          includedTemplate.template.executeWithInContext(parseList.env);
        }
      }
    }
  });
  
  
  /**
   * extend
   */
    muttonchops.registerTag('extends', {
    preprocess: function(tok, parseList) {
      // Ensure it is the first statement!
      if(parseList.position == 0) {
      
        if(tok.parts[0]) {
          // Get the lookup
          // first set is a variable, second is double quoted string, and thrid is single quoted string
          var m = tok.parts[0].match(/^([a-zA-Z_]\w*(\.[a-zA-Z_]\w*)*)$|^"(.*)"$|^'(.*)'$/);
          
          if(!m) {
            return;
          }
          tok.location = m[1] || m[3] || m[4];
          tok.isValue = !!(m[1]);
          
          // Now find all the blocks
          tok.blocks = {};
          
          var token = parseList.next();
          while(token) {
            if(token.type == 'tag' && token.name == 'block') {
              parseList.preprocessToken(token);
              if(token.blockName) {
                tok.blocks[token.blockName] = parseList.position;
              }
            }
            token = parseList.next();
          }
          // No point in rewinding because anything that could be touched already has  
        }
      }
    },
    execute: function(tok, parseList) {
      if(tok.location) {
        
        var loc = tok.location;
        if(tok.isValue) {
          loc = parseList.env.getValue(loc);
        }
        
        // Register this templates blocks
        parseList.env.blocks = parseList.env.blocks || {};
        _.each(tok.blocks, function(pos, name) {
          if(!parseList.env.blocks[name]) {
            parseList.env.blocks[name] = {parseList: parseList, position: pos};
          }
        });
        
        var includedTemplate = parseList.env.templateLoader.fetch(loc);
        if(includedTemplate) {
          includedTemplate.template.executeWithInContext(parseList.env);
        }
        
        // skip to the end
        parseList.forwardTo(parseList.length);
      }
    }
  });

  
  /**
   * block
   */
  muttonchops.registerTag('block', {
    preprocess: function(tok, parseList) {
      if(tok.parts[0]) {
        tok.blockName = tok.parts[0];
        
        var startPos = parseList.position;
        
        var token = parseList.next();
        while(token && !(token.type == 'tag' && token.name == 'endblock' )) {
          parseList.preprocessToken(token);
          if(token.type == 'tag' && token.name == 'block') {
            parseList.forwardTo(token.endBlockPosition);
          }
          token = parseList.next();
        }
        tok.endBlockPosition = parseList.position;
        parseList.rewindTo(startPos);
      }
    },
    execute: function(tok, parseList) {
      // defer block to another template
      if(parseList.env.blocks && parseList.env.blocks[tok.blockName] && parseList.env.blocks[tok.blockName].parseList != parseList) {
        var bd = parseList.env.blocks[tok.blockName];
        bd.parseList.rewindTo(bd.position);
        bd.parseList.execToken(bd.parseList.get(bd.position));
        parseList.forwardTo(tok.endBlockPosition);
        
      // run this block
      } else {
        var token = parseList.next();
        while(token && parseList.position < tok.endBlockPosition) {
          parseList.execToken(token);
          token = parseList.next();
        }
      }
    }
  });
})();