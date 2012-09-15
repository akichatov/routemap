module MapApiKeys
  CONFIG = YAML.load_file(Rails.root.join("config/map_api_keys.yml"))[Rails.env]
  GOOGLE = CONFIG['google']
end