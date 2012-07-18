describe('branching tags', function() {
  // if
  it('should print nothing when `if` evaluates to false', function() {
    var template = muttonchops.make('{% if v %} if-block {% endif %}');
    expect(template({v: false})).toBe('');
  });
  
  it('should print the if-block when `if` evaluates to true', function() {
    var template = muttonchops.make('{% if v %} if-block {% endif %}');
    expect(template({v: true})).toBe(' if-block ');
  });
  
  // unless
  it('should print the unless-block when `unless` evaluates to false', function() {
    var template = muttonchops.make('{% unless v %} unless-block {% endif %}');
    expect(template({v: false})).toBe(' unless-block ');
  });
  
  it('should print nothing when `unless` evaluates to true', function() {
    var template = muttonchops.make('{% unless v %} unless-block {% endif %}');
    expect(template({v: true})).toBe('');
  });
  
  // if else
  it('should print else-block when `if` evaluates to false', function() {
    var template = muttonchops.make('{% if v %} if-block {%else %} else-block {% endif %}');
    expect(template({v: false})).toBe(' else-block ');
  });
  
  it('should print the if-block when `if` evaluates to true with `else` block', function() {
    var template = muttonchops.make('{% if v %} if-block {% else %} else-block {% endif %}');
    expect(template({v: true})).toBe(' if-block ');
  });
  
  // unless else
  it('should print the unless-block when `unless` evaluates to false with `else`', function() {
    var template = muttonchops.make('{% unless v %} unless-block {% else %} else-block {% endif %}');
    expect(template({v: false})).toBe(' unless-block ');
  });
  
  it('should print else-block when `unless` evaluates to true', function() {
    var template = muttonchops.make('{% unless v %} unless-block {% else %} else-block {% endif %}');
    expect(template({v: true})).toBe(' else-block ');
  });
  
  // if elseif
  it('should print the elseif-block when `if` evaluates to false and `elseif` evaluates to true',     function() {
    var template = muttonchops.make('{% if v %} if-block {%elseif w %} elseif-block {% endif %}');
    expect(template({v: false, w: true})).toBe(' elseif-block ');
  });
  
  it('should print the if-block when `if` evaluates to true with `elseif` evaluation as true too', function() {
    var template = muttonchops.make('{% if v %} if-block {% elseif w %} elseif-block {% endif %}');
    expect(template({v: true, w: true})).toBe(' if-block ');
  });
  
    it('should print nothing when both `if` and `elseif` evaluation to false', function() {
    var template = muttonchops.make('{% if v %} if-block {% elseif w %} elseif-block {% endif %}');
    expect(template({v: false, w: false})).toBe('');
  });
  
    // unless elseif
  it('should print the unless-block when `unless` evaluates to false and `elseif` evalutes to true too', function() {
    var template = muttonchops.make('{% unless v %} unless-block {% elseif w %} elseif-block {% endif %}');
    expect(template({v: false, w: true})).toBe(' unless-block ');
  });
  
  it('should print elseif-block when `unless` evaluates to true and `elseif` evaluates to true', function() {
    var template = muttonchops.make('{% unless v %} unless-block {% elseif w %} elseif-block {% endif %}');
    expect(template({v: true, w: true})).toBe(' elseif-block ');
  });
  
  it('should print nothing when `unless` evaluates to true and `elseif` evaluates to false', function() {
    var template = muttonchops.make('{% unless v %} unless-block {% elseif w %} elseif-block {% endif %}');
    expect(template({v: true, w: false})).toBe('');
  });
  
  it('should print the print the outer if and the nested else block', function() {
    var template = muttonchops.make('{% if v %}a{% if w %}b{% else %}c{% endif %}d{% else %}e{% endif %}');
    expect(template({v: true, w: false})).toBe('acd');
  });
});


describe('looping tags', function() {

});


describe('include tags', function() {

});


describe('extend tags', function() {

});