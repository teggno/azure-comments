const promisedHttpsRequest = require("../common/http").promisedHttpsRequest;
const url = require("url");
const getSettings = require("../common/settings").getSettings;

module.exports = async function(context, textanalyticsQueueItem) {
  context.log(
    "JavaScript queue trigger function processed work item",
    textanalyticsQueueItem
  );

  const requestBody = JSON.stringify({
    documents: [
      {
        id: "1",
        text: context.bindings.commentsTableBinding.text
      }
    ]
  });

  var settings = getSettings();
  const urlObj = url.parse(settings.cognitiveservicesSentimentUrl);
  const requestOptions = {
    method: "POST",
    path: urlObj.pathname,
    host: urlObj.hostname,
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": settings.cognitiveservicesKey
    }
  };
  var textAnalyticsResultRaw = await promisedHttpsRequest(
    requestOptions,
    requestBody
  );
  context.log(textAnalyticsResultRaw);
};
