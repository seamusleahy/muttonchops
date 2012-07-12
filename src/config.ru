Compass.configuration do |compass|
  compass.fonts_path = 'assets'
end

Sprockets::Helpers.configure do |config|
  config.environment = environment
  config.prefix      = "/assets"
  config.digest      = false
end