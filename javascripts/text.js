// Generated by CoffeeScript 1.3.3
(function() {
  var $, root;

  root = this;

  $ = root.jQuery || root.$;

  $('.header').find('h1, h2').each(function() {
    var el;
    el = $(this);
    return el.html(el.html().replace(/\s/g, '&nbsp;'));
  }).lettering();

}).call(this);
