const nodeMailer = require("nodemailer");
const getSettings = require("./settings").getSettings;

module.exports = function(options) {
  const settings = getSettings();
  const transporter = nodeMailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword
    }
  });
  if (!options.from) options.from = settings.emailFrom;
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (error, info) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};
