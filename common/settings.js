exports.getSettings = () => ({
  recaptchaSkip: getRawSetting("recaptcha_skip") === "true",
  recaptchaUrl: getRawSetting("recaptcha_url"),
  recaptchaSecret: getRawSetting("recaptcha_secret"),
  cognitiveservicesSentimentUrl: getRawSetting("cognitiveservices_sentiment_url"),
  cognitiveservicesKey: getRawSetting("cognitiveservices_key")
});

function getRawSetting(name) {
  return process.env[name];
}
