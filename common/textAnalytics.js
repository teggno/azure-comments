const promisedHttpsRequest = require("./http").promisedHttpsRequest;
const url = require("url");
const getSettings = require("../common/settings").getSettings;

exports.sentiment = async function(text) {
  var settings = getSettings();
  return await request(settings.cognitiveServicesSentimentUrl, text);
}

exports.keyPhrases = async function(text) {
  var settings = getSettings();
  return await request(settings.cognitiveServicesKeyPhrasesUrl, text);
}

async function request(apiUrl, text){
  const requestBody = JSON.stringify({
    documents: [
      {
        id: "1",// doesn't matter as we're only sending one document
        text: text
      }
    ]
  });

  var settings = getSettings();
  const urlObj = url.parse(apiUrl);
  const requestOptions = {
    method: "POST",
    path: urlObj.pathname,
    host: urlObj.hostname,
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": settings.cognitiveServicesKey
    }
  };
  var raw = await promisedHttpsRequest(
    requestOptions,
    requestBody
  );
  return JSON.parse(raw);
}

