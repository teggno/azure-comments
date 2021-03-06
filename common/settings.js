exports.getSettings = () => ({
  storageConnectionString: getRawSetting("adw1blogcomments_STORAGE"),
  recaptchaSkip: getBoolean(getRawSetting("recaptcha_skip")),
  recaptchaUrl: getRawSetting("recaptcha_url"),
  recaptchaSecret: getRawSetting("recaptcha_secret"),
  minRecaptchaScore: parseFloat(getRawSetting("minRecaptchaScore")),
  minSentimentScore: parseFloat(getRawSetting("minSentimentScore")),
  minKeyPhraseIntersections: parseInt(
    getRawSetting("minKeyPhraseIntersections")
  ),
  minKeyPhrases: parseInt(getRawSetting("minKeyPhrases")),
  cognitiveServicesSentimentUrl: getRawSetting(
    "cognitiveservices_sentiment_url"
  ),
  cognitiveServicesKeyPhrasesUrl: getRawSetting(
    "cognitiveservices_keyphrases_url"
  ),
  cognitiveServicesKey: getRawSetting("cognitiveservices_key"),
  moderateCommentPageUrl: key =>
    `${getRawSetting("moderateCommentPageUrl")}?key=${key}`,
  moderatorEmail: getRawSetting("moderatorEmail"),
  smtpHost: getRawSetting("smtpHost"),
  smtpPort: parseInt(getRawSetting("smtpPort")),
  smtpSecure: getBoolean(getRawSetting("smtpSecure")),
  smtpUser: getRawSetting("smtpUser"),
  smtpPassword: getRawSetting("smtpPassword"),
  emailFrom: getRawSetting("emailFrom")
});

function getRawSetting(name) {
  return process.env[name];
}

function getBoolean(raw) {
  return (typeof raw === "boolean" && raw) || raw === "true";
}
