describe('Make a template from an empty string', function() {
  
  it('should get a function back from muttonchops.make()', function() {
    var template = muttonchops.make('');
    expect(typeof template).toBe('function');
  });
  
  it('should have access to template attribute on return function', function() {
    var template = muttonchops.make('');
    expect(typeof template.template.execute).toBe('function');
    expect(typeof template.template.serialize).toBe('function');
    expect(typeof template.template.executeWithInContext).toBe('function');
  });
  
  it('should return an empty string when executed', function() {
    var template = muttonchops.make('');
    expect(template({foo: 2})).toBe('');
    expect(template.template.execute({foo: 2})).toBe('');
  });
  
  it('should return an empty array when serialized', function() {
    var template = muttonchops.make('');
    var serialized = template.template.serialize();
    expect(serialized instanceof Array).toBe(true);
    expect(serialized.length).toBe(0);
  });

  it('should return an empty string when serializing and unserializing', function() {
    var template = muttonchops.make('');
    var serialized = template.template.serialize();
    var unserialized = muttonchops.make(serialized);
    expect(unserialized({foo: 3})).toBe('');;
  });
});


describe('Make a template from a single text token', function() {
  var src = 'this is the text string';
  
  it('should get a function back from muttonchops.make()', function() {
    var template = muttonchops.make(src);
    expect(typeof template).toBe('function');
  });
  
  it('should have access to template attribute on return function', function() {
    var template = muttonchops.make(src);
    expect(typeof template.template.execute).toBe('function');
    expect(typeof template.template.serialize).toBe('function');
    expect(typeof template.template.executeWithInContext).toBe('function');
  });
  
  it('should return a string the same as the source when executed', function() {
    var template = muttonchops.make(src);
    expect(template({foo: 2})).toBe(src);
    expect(template.template.execute({foo: 2})).toBe(src);
  });
  
  it('should return an array with a single element when serialized', function() {
    var template = muttonchops.make(src);
    var serialized = template.template.serialize();
    expect(serialized instanceof Array).toBe(true);
    expect(serialized.length).toBe(1);
  });

  it('should return a string that is the same as the source when serializing and unserializing', function() {
    var template = muttonchops.make(src);
    var serialized = template.template.serialize();
    var unserialized = muttonchops.make(serialized);
    expect(unserialized({foo: 3})).toBe(src);;
  });
});



describe('Make a template from a single print token', function() {
  var src = '{{ a_variable }}';
  
  it('should get a function back from muttonchops.make()', function() {
    var template = muttonchops.make(src);
    expect(typeof template).toBe('function');
  });
  
  it('should have access to template attribute on return function', function() {
    var template = muttonchops.make(src);
    expect(typeof template.template.execute).toBe('function');
    expect(typeof template.template.serialize).toBe('function');
    expect(typeof template.template.executeWithInContext).toBe('function');
  });
  
  it('should return an empty string when executed when the variable is not passed', function() {
    var template = muttonchops.make(src);
    expect(template({foo: 2})).toBe('');
    expect(template.template.execute({foo: 2})).toBe('');
  });
  
  it('should return a string with the value of the variable when executed', function() {
    var template = muttonchops.make(src);
    expect(template({a_variable: 2})).toBe('2');
    expect(template.template.execute({a_variable: 2})).toBe('2');
  });
  
  it('should return an array with a single element when serialized', function() {
    var template = muttonchops.make(src);
    var serialized = template.template.serialize();
    expect(serialized instanceof Array).toBe(true);
    expect(serialized.length).toBe(1);
  });

  it('should return an empty string when serializing and unserializing when the variable is not passed', function() {
    var template = muttonchops.make(src);
    var serialized = template.template.serialize();
    var unserialized = muttonchops.make(serialized);
    expect(unserialized({foo: 3})).toBe('');;
  });
  
  it('should return a string with the value of the variable when serializing and unserializing when the variable is not passed', function() {
    var template = muttonchops.make(src);
    var serialized = template.template.serialize();
    var unserialized = muttonchops.make(serialized);
    expect(unserialized({a_variable: 3})).toBe('3');;
  });
});



describe('Make a template from string with text and print tokens', function() {
  var src = 'My name is {{ name }}!';
  
  it('should get a function back from muttonchops.make()', function() {
    var template = muttonchops.make(src);
    expect(typeof template).toBe('function');
  });
  
  it('should have access to template attribute on return function', function() {
    var template = muttonchops.make(src);
    expect(typeof template.template.execute).toBe('function');
    expect(typeof template.template.serialize).toBe('function');
    expect(typeof template.template.executeWithInContext).toBe('function');
  });
  
  it('should return a string with just the text parts when executed when the variable is not passed', function() {
    var template = muttonchops.make(src);
    expect(template({foo: 2})).toBe('My name is !');
    expect(template.template.execute({foo: 2})).toBe('My name is !');
  });
  
  it('should return a string with the value of the variable inserted between the text parts when executed', function() {
    var template = muttonchops.make(src);
    expect(template({name: 'Slim Shady'})).toBe('My name is Slim Shady!');
    expect(template.template.execute({name: 'Slim Shady'})).toBe('My name is Slim Shady!');
  });
  
  it('should return an array with a three element when serialized', function() {
    var template = muttonchops.make(src);
    var serialized = template.template.serialize();
    expect(serialized instanceof Array).toBe(true);
    expect(serialized.length).toBe(3);
    expect(serialized[0].type).toBe('text');
    expect(serialized[1].type).toBe('print');
    expect(serialized[2].type).toBe('text');
  });

  it('should return a string with just the text parts when the variable is not passed when serializing and unserializing when the variable is not passed', function() {
    var template = muttonchops.make(src);
    var serialized = template.template.serialize();
    var unserialized = muttonchops.make(serialized);
    expect(unserialized({foo: 3})).toBe('My name is !');;
  });
  
  it('should return a string with the value of the variable inserted between the text parts serializing and unserializing when the variable is not passed', function() {
    var template = muttonchops.make(src);
    var serialized = template.template.serialize();
    var unserialized = muttonchops.make(serialized);
    expect(unserialized({name: 'Nicki'})).toBe('My name is Nicki!');;
  });
});



describe('Make a template from string with a tag tokens', function() {

});