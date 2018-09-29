exports.getSettings = () => ({
  recaptchaSkip: getRawSetting("recaptcha_skip") === "true",
  recaptchaUrl: getRawSetting("recaptcha_url"),
  recaptchaSecret: getRawSetting("recaptcha_secret")
});

function getRawSetting(name) {
  return process.env[name];
}
