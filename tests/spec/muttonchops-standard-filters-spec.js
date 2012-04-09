describe('Use an invalid filter', function() {
  it('should return the value uneffected', function() {
    var template = muttonchops.make('{{v|badfilterboo}}');
    expect(template({v: 'this is the value'})).toBe('this is the value');
  });
});


describe('Use the underscore.string based filters', function() {
  it('capitalize: should capitalize the variable', function() {
    var template = muttonchops.make('{{v|capitalize}}');
    expect(template({v: 'epeli'})).toBe('Epeli');
  });
  
  it('clean: should remove the extra whitespace the variable', function() {
    var template = muttonchops.make('{{v|clean}}');
    expect(template({v: ' foo    bar   '})).toBe('foo bar');
  });
  
  it('count: should return the count of a substring in a  variable', function() {
    var template = muttonchops.make('{{v|count:l}}');
    expect(template({v: 'Hello world'})).toBe('3');
  });
  
  it('escapeHTML: should return the HTML escaped in a variable', function() {
    var template = muttonchops.make('{{v|escapeHTML}}');
    expect(template({v: '<div>Blah blah blah</div>'})).toBe('&lt;div&gt;Blah blah blah&lt;/div&gt;');
  });
  
  it('unescapeHTML: should return the unescaped HTML in a variable', function() {
    var template = muttonchops.make('{{v|unescapeHTML}}');
    expect(template({v: '&lt;div&gt;Blah blah blah&lt;/div&gt;'})).toBe('<div>Blah blah blah</div>');
  });
  
  it('insert: should return the string inserted in a variable', function() {
    var template = muttonchops.make("{{v|insert:6, 'world'}}");
    expect(template({v: 'Hello '})).toBe('Hello world');
  });
  
  it('reverse: should return the string reversed in a variable', function() {
    var template = muttonchops.make("{{v|reverse}}");
    expect(template({v: 'foobar'})).toBe('raboof');
  });
  
  it('splice: should return the string with a substring replacing a portion in a variable', function() {
    var template = muttonchops.make("{{v|splice:30, 7, 'epeli'}}");
    expect(template({v: 'https://edtsech@bitbucket.org/edtsech/underscore.strings'})).toBe('https://edtsech@bitbucket.org/epeli/underscore.strings');
  });
  
  it('succ: should return the successor to a variable', function() {
    var template = muttonchops.make("{{v|succ}}");
    expect(template({v: 'a'})).toBe('b');
  });
  
  it('camelize: should convert underscore or dasherized string to camelized', function() {
    var template = muttonchops.make("{{v|camelize}}");
    expect(template({v: '-moz-transform'})).toBe('MozTransform');
  });
  
  it('underscored: should convert a camelized or dasherized string into an underscored one', function() {
    var template = muttonchops.make("{{v|underscored}}");
    expect(template({v: 'MozTransform'})).toBe('moz_transform');
  });
  
  it('dasherize: should convert a underscored or camelized string into an dasherized one', function() {
    var template = muttonchops.make("{{v|dasherize}}");
    expect(template({v: 'MozTransform'})).toBe('-moz-transform');
  });
  
  it('humanize: should convert an underscored, camelized, or dasherized string into a humanized one. Also removes beginning and ending whitespace, and removes the postfix \'_id\'', function() {
    var template = muttonchops.make("{{v|humanize}}");
    expect(template({v: '  capitalize dash-CamelCase_underscore trim  '})).toBe('Capitalize dash camel case underscore trim');
  });
  
  it('trim: trims defined characters from begining and ending of the string. Defaults to whitespace characters', function() {
    var template = muttonchops.make("{{v|trim}}");
    expect(template({v: '  foobar   '})).toBe('foobar');
    var template = muttonchops.make("{{v|trim:'_-'}}");
    expect(template({v: '_-foobar-_'})).toBe('foobar');
  });
  
  it('ltrim: should trim only from the left', function() {
    var template = muttonchops.make("{{v|ltrim}}");
    expect(template({v: '  foobar   '})).toBe('foobar   ');
    var template = muttonchops.make("{{v|ltrim:'_-'}}");
    expect(template({v: '_-foobar-_'})).toBe('foobar-_');
  });
  
  it('rtrim: should trim only from the right', function() {
    var template = muttonchops.make("{{v|rtrim}}");
    expect(template({v: '  foobar   '})).toBe('  foobar');
    var template = muttonchops.make("{{v|rtrim:'_-'}}");
    expect(template({v: '_-foobar-_'})).toBe('_-foobar');
  });
  
  it('truncate: should truncate a string to a given length', function() {
    var template = muttonchops.make("{{v|truncate:5}}");
    expect(template({v: 'Hello world'})).toBe('Hello...');
    var template = muttonchops.make("{{v|truncate:5,' more'}}");
    expect(template({v: 'Hello world'})).toBe('Hello more');
  });
  
  it('prune: should be an elegant version of truncate', function() {
    var template = muttonchops.make("{{v|prune:5}}");
    expect(template({v: 'Hello world'})).toBe('Hello...');
    var template = muttonchops.make("{{v|prune:8,' more'}}");
    expect(template({v: 'Hello world'})).toBe('Hello more');
  });
  
  it('pad: should pad the str with characters until the total string length is equal to the passed length parameter', function() {
    var template = muttonchops.make("{{v|pad:8}}");
    expect(template({v: '1'})).toBe('       1');
    var template = muttonchops.make("{{v|pad:8, '0'}}");
    expect(template({v: '1'})).toBe('00000001');
    var template = muttonchops.make("{{v|pad:8, '0', 'right'}}");
    expect(template({v: '1'})).toBe('10000000');
    var template = muttonchops.make("{{v|pad:8, '0', 'both'}}");
    expect(template({v: '1'})).toBe('00001000');
  });
  
  it('lpad: alias for pad:length, padstr, \'left\'', function() {
    var template = muttonchops.make("{{v|lpad:8, '0'}}");
    expect(template({v: '1'})).toBe('00000001');
  });
  
  it('rpad: alias for pad:length, padstr, \'right\'', function() {
    var template = muttonchops.make("{{v|rpad:8, '0'}}");
    expect(template({v: '1'})).toBe('10000000');
  });
  
  it('lrpad: alias for pad:length, padstr, \'both\'', function() {
    var template = muttonchops.make("{{v|lrpad:8, '0'}}");
    expect(template({v: '1'})).toBe('00001000');
  });
  
  it('stripTags: should remove HTML tags', function() {
    var template = muttonchops.make("{{v|stripTags}}");
    expect(template({v: 'a <a href="#">link</a><script>alert("hello world!")</script>'})).toBe('a linkalert("hello world!")');
  });
  
  it('repeat: should repeat a string count times', function() {
    var template = muttonchops.make("{{v|repeat:3}}");
    expect(template({v: 'foo'})).toBe('foofoofoo');
    var template = muttonchops.make("{{v|repeat:3, 'bar'}}");
    expect(template({v: 'foo'})).toBe('foobarfoobarfoo');
  });
  
  it('slugify: should transform text into a URL slug', function() {
    var template = muttonchops.make("{{v|slugify}}");
    expect(template({v: 'Yummy-yummy in my tummy: that\'s she said'})).toBe('yummy-yummy-in-my-tummy-thats-she-said');
  });
});


describe('Use a chain of filters', function() {
  it('should apply the filters from left to right', function() {
    var template = muttonchops.make('{{v|pad:3, "0"|repeat:3}}');
    expect(template({v: '1'})).toBe('001001001');
  });
});
