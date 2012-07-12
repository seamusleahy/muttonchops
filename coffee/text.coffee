root = this
$ = root.jQuery || root.$

$('.header').find('h1, h2').each(()->
  el = $(this)
  el.html(el.html().replace(/\s/g, '&nbsp;'))
).lettering()