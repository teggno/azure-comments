const localSettings = require("../local.settings.json");

Object.keys(localSettings.Values).forEach(key => process.env[key] = localSettings.Values[key]);