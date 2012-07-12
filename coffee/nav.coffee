root = this
$ = root.jQuery || root.$
$window = $(window)

navEl = $('.nav').each(() ->
  el = $(this)
  anchors = []
  currentEl = null
  
  el.find('a').each(() -> 
    link = $(this)
    anchor = link.attr('href')
    top = $(anchor).offset().top
    anchors.push({ top: top, anchor: anchor, el: link })
  );
  
  anchors.sort((a,b) -> a.top - b.top )
  
  update = (event) ->
    top = $window.scrollTop()
    height = $window.height()
    
    i = 0
    while i < anchors.length && anchors[i].top < (top - height/3) && anchors[i].top+anchors[i].el.outerHeight() < (top)
      console.log(i, anchors[i].top, anchors[i].top + anchors[i].el.outerHeight(), top)
      ++i
    console.log(i, anchors[i].top, anchors[i].top + anchors[i].el.outerHeight(), top)
    i = Math.min(anchors.length - 1, i)
    
    if currentEl != anchors[i].el
      currentEl.removeClass('highlight') if currentEl
      currentEl = anchors[i].el.addClass('highlight')
    
  
  $window.on('resize scroll', update)
  update()
)

