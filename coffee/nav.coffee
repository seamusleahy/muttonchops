root = this
$ = root.jQuery || root.$
$window = $(window)

navEl = $('.nav').each(() ->
  el = $(this)
  anchors = []
  currentEl = null
  
  update = (event) ->
    top = $window.scrollTop()
    height = $window.height()
    
    i = 0
    while i < anchors.length && anchors[i].top < top
      ++i
    i = Math.min(anchors.length - 1, i)
    
    if currentEl != anchors[i].el
      currentEl.removeClass('highlight') if currentEl
      currentEl = anchors[i].el.addClass('highlight')
  
  calculate = () ->
    topOff = if el.css('bottom') == 'auto' then el.height() else 0
    anchors = []
    el.find('a').each(() -> 
      link = $(this)
      anchor = link.attr('href')
      anchorEl = $(anchor)
      top = anchorEl.offset().top + topOff
      anchors.push({ top: top, anchor: anchor, el: link, anchorEl: anchorEl })
      
      link.data('anchorEl', anchorEl)
    ).off('click').on('click', (event) ->
      $('body').animate({scrollTop: $(this).data('anchorEl').offset().top - topOff}, 200)
      dummy = $('<div></div>', 
        {id: $(this).attr('href').replace(/^#/, ''), 
        css: {
          position: 'absolute', 
          visibility:'hidden',
          top: $window.scrollTop() + 'px'}
        }).prependTo('body')
      setTimeout(() -> 
        dummy.remove()
      , 20)
    )
    anchors.sort((a,b) -> a.top - b.top )
    update();
  
  calculate()
  
  $window.on('scroll', update)
  $window.on('resize', calculate)
)

