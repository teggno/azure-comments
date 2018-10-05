exports.getSettings = () => ({
  storageConnectionString: getRawSetting("adw1blogcomments_STORAGE"),
  recaptchaSkip: getRawSetting("recaptcha_skip") === "true",
  recaptchaUrl: getRawSetting("recaptcha_url"),
  recaptchaSecret: getRawSetting("recaptcha_secret"),
  minRecaptchaScore: parseFloat(getRawSetting("minRecaptchaScore")),
  minSentimentScore: parseFloat(getRawSetting("minSentimentScore")),
  minKeyphraseIntersections: parseInt(getRawSetting("minKeyphraseIntersections")),
  minKeyphrases: parseInt(getRawSetting("minKeyphrases")),
  cognitiveServicesSentimentUrl: getRawSetting("cognitiveservices_sentiment_url"),
  cognitiveServicesKeyPhrasesUrl: getRawSetting("cognitiveservices_keyphrases_url"),
  cognitiveServicesKey: getRawSetting("cognitiveservices_key")
});

function getRawSetting(name) {
  return process.env[name];
}
