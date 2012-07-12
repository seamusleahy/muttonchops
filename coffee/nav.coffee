root = this
$ = root.jQuery || root.$

navEl = $('.nav').each(() ->
  el = $(this)
  listEl = el.find('ul')
  toggleButton = el.find('.toggle-button')
  openHeight = listEl.height()
  console.log(openHeight)
  showing = false;
  listEl.addClass('collapsed')

  toggleButton.on('click', (event) ->
    listEl.stop() # Stop the animation

    to = if showing then 0 else openHeight
    from = listEl.height()

    showing = !showing
    listEl.height(from).animate({ height: to+'px'}, 300, () ->
      listEl.toggleClass('collapsed', !showing).css({height: ''})
    )
  )
)

navList = navEl.find('ul')

