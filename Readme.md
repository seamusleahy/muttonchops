# Muttonchops: A Javascript Template Parser #

This is currently a work in processes.

Muttonchops is inspired by the Django Template language. It is pure Javascript based with the goal
of bring the awesomeness of the Django Template language to Javascript and to be flexibly and 
extendable.

## Basic usage ##

Pass the template as a string into the Muttonchops make function to parse the string into a template function.

```javascript
var template = muttonchops.make('Hello, my name is {{name}}. {% if location %}I live in {{location}}{% endif %}');
var output = template( {name: 'James'} );
$('#output').html( output );```

## Print values ##

You can print values you pass in by placing the variable name between: `{{ varname }}`. You can access object attributes too using the dot notation: `{{ varname.sub }}`. If the attribute is a function, it
will be called and the return value is used: `{{ varname.subfn }}`.

### Filters ###

You can easily filter the values for output by using a filter. To use a filter, place a pipe `|` after the variable followed by the filter name: `{{ varname|reverse }}`. For some filters, you can pass in arguments: `{{ varname|repeat:3 }}`. And when one filter is not enough, you can chain multiple filters together: `{{ varname|reverse|repeat:3 }}`.

## Tags ##

Tags are the part that do pretty much everything else. They can be used to do conditional logic, looping, including sub-template, etc. Each tag starts with the tag name then is followed by whatever the format for the tag is.

```
{% if location %}
  We got a location.
{% else %}
  We don't have a location.
{% endif %}```

## Register custom filters and tags ##

At its core, Muttonchops just parses the string into a template that can be executed. But none of the filters or tags are hooked up to anything. Usually you would include the standard Muttonchop set of filters and tags; but you could create your whole own set or just add your own along side the standard set.

### muttonchops.registerFilter ###

Registering a filter just requires a filter name and a callback function.

```javascript
muttonchops.registerFilter('filterName', function(value[, extraParam]*) {
  // do your filter action to value
  return <a value>;
});```

### muttonchops.registerTag ###

Registering a tag has more options than a filter.

The simplest is providing a tag name and function to run at execution.

```javascript
muttonchops.registerTag('tagName', function(thisToken, parseList) {
  // print out the tag as it would appear in the source
  parseList.env.print('{% '+thisToken.value+' %}');
});```

Now maybe you want to get more advance and take advantage of preprocessing which is useful to cache information. The preprocessing will also run before serializing a template.

```javascript
muttonchops.registerTag('tagName', {
  preproces: function(thisToken, parseList) {
    thisToken.output = '{% '+thisToken.value+' %}';
  },
  
  execute: function(thisToken, parseList) {
  // print out the tag as it would appear in the source
  parseList.env.print(thisToken.output);
});```

The `thisToken` parament is a simple object that contains the information for the tag. You can add date to it as you like as long as it can be serialized to JSON. This means everything has to be either a number, string, boolean, null, array, or a simple object - no functions or advance objects.

Muttonchops by default adds three values to `thisToken`:

1. `value`: the raw value of the tag
2. `name`: the tag name
3. `parts`: an array of values split by whitespace after the tag name (quoted strings are not broken in the middle of)

The `parseList` is the object that contains the parsed template and contains the rest of the functionality.

1. `parseList.end()`: return true if at the end, otherwise, false
2. `parseList.next()`: advances to the next token in the parse list and returns it
3. `parseList.peek()`: returns the next token without advancing the position
4. `parseList.rewindTo(position or token)`: rewinds the current position to a position or to a token
5. `parseList.forwardTo(position or toke)`: moves the current position forward to a position or to a token
6. `parseList.get(position)`: get the token at a position
7. `parseList.execToken(token)`: execute a token
8. `parseList.position`: the current position
9. `parseList.length`: the number of tokens
10. `parseList.env`: the Environment object for when the template is being executed

The Environment objects contains the data regarding the current execution such as the output and input data.

1. `parseList.env.print( output )`: appends the `output` to the resulting output
2. `parseList.env.getValue( variable )`: get the value of a variable from the data passed in
3. `parseList.env.templateLoader`: the template loader object to use

## Standard Filters ##

Currently the set of standard filters is a selection of Javascript string methods and a binding of the Underscore String library.

## Standard Tags ##

### Branching: if, unless, elseif, else, endif ###

### Looping: for, empty, endfor ###

### Sub-templates: include ###

### Template extension: extends, block, endblock ###