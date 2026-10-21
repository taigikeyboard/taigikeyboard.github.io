require 'cgi'
require 'json'
require 'uri'
require 'yaml'

# Checks translation completeness and links/metadata in the built language pages.
root = File.expand_path('..', __dir__)
destination = File.expand_path(ARGV.fetch(0, '_site'), root)
baseurl = ARGV.fetch(1, '')
languages = YAML.safe_load_file("#{root}/_data/languages.yml")
locales = languages.to_h { |language| [language['id'], YAML.safe_load_file("#{root}/_data/locales/#{language['id']}.yml")] }

def shape(value)
  case value
  when Hash then value.transform_values { |child| shape(child) }
  when Array then value.map { |child| shape(child) }
  else value.class.name
  end
end

reference = shape(locales.fetch('nan'))
downloads = nil
languages.each do |language|
  id, path, tag = language.values_at('id', 'path', 'tag')
  raise "Incomplete translation structure: #{id}" unless shape(locales.fetch(id)) == reference
  platform_keys = ->(locale) { locale['install']['platforms'].map { |platform| platform.values_at('id', 'requires') } }
  raise "Different platform gates: #{id}" unless platform_keys.call(locales[id]) == platform_keys.call(locales['nan'])
  html = File.read("#{destination}#{path}index.html")
  raise "Wrong HTML language: #{id}" unless html.include?(%(<html lang="#{tag}">))
  raise "Missing translated heading: #{id}" unless html.include?(locales[id]['about']['title'])
  raise "Missing page description: #{id}" unless html.match?(/<meta name="description" content="[^"]+"/)
  canonical = "https://taigikeyboard.tw#{baseurl}#{path}"
  raise "Wrong canonical: #{id}" unless html.include?(%(<link rel="canonical" href="#{canonical}"))
  raise "Unrendered Liquid: #{id}" if html.include?('{{') || html.include?('{%')
  raise "Empty rendered label: #{id}" if html.match?(/<(h[1-3]|a|label|legend)\b[^>]*>\s*<\/\1>/)
  languages.each do |alternate|
    url = "https://taigikeyboard.tw#{baseurl}#{alternate['path']}"
    raise "Missing language alternate: #{id}" unless html.include?(%(<link rel="alternate" hreflang="#{alternate['tag']}" href="#{url}">))
    raise "Missing language link: #{id}" unless html.include?(%(<a href="#{baseurl}#{alternate['path']}" lang="#{alternate['tag']}"))
  end
  current = html.scan(/<a\b[^>]*aria-current="true"[^>]*>/)
  raise "Wrong active language: #{id}" unless current.length == 1 && current.first.include?(%(lang="#{tag}"))
  schemas = html.scan(/<script type="application\/ld\+json">(.*?)<\/script>/m).map { |match| JSON.parse(match.first) }
  app = schemas.find { |schema| schema['@type'] == 'SoftwareApplication' }
  raise "Missing application schema: #{id}" unless app
  downloads ||= app.fetch('downloadUrl')
  raise "Different downloads across languages: #{id}" unless downloads == app.fetch('downloadUrl')
  raise "Missing payment links: #{id}" unless html.include?('https://p.ecpay.com.tw/AA663DE') && html.include?('https://www.paypal.com/ncp/payment/AZNAN8NSJXR7J')

  html.scan(/(?:href|src)="([^"]+)"/).flatten.each do |raw|
    url = CGI.unescapeHTML(raw)
    next unless url.start_with?('/') || url.start_with?('#')
    uri = URI.parse(url)
    target_path = uri.path.empty? ? path : uri.path.delete_prefix(baseurl)
    target = "#{destination}#{target_path}"
    target = "#{target}index.html" if target.end_with?('/')
    raise "Broken internal link: #{id} #{url}" unless File.file?(target)
    if uri.fragment && target.end_with?('.html')
      raise "Missing anchor: #{id} #{url}" unless File.read(target).include?(%(id="#{uri.fragment}"))
    end
  end
end
%w[privacypolicy codesigning].each do |policy|
  html = File.read("#{destination}/#{policy}.html")
  raise "Wrong legal page language: #{policy}" unless html.include?('<html lang="en">')
  raise "Wrong legal page home: #{policy}" unless html.include?(%(href="#{baseurl}/en/#install"))
end
raise 'Planning document published' if File.exist?("#{destination}/planning.html") || File.exist?("#{destination}/planning.md")
puts "Locale structure, language navigation, metadata, JSON-LD, downloads, payment links, and internal targets passed (#{languages.length} languages)."
