const recaptcha = require("../common/recaptcha");
const getSettings = require("../common/settings").getSettings;
const queueMessage = require("../common/queueMessage");

module.exports = async function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");
  if (!validateBodyIsComment(req.body)) {
    context.res = {
      status: 400,
      body: getMalformedRequestErrorMessage()
    };
    return;
  }
  var recaptchaResult;
  const settings = getSettings();
  if (settings.recaptchaSkip){
    recaptchaResult = { score: 1}
  }
  else {
    recaptchaResult = await verifyCaptcha(req.body.captchaToken, context.log);
    if (!captchaResult.success) {
      context.res = {
        status: 400,
        body: "Captcha rejected."
      };
      return;
    }
  }

  const partitionKey = req.body.postUrl;
  const rowKey = context.bindingData.sys.randGuid;
  const entity = createEntity(
    req.body,
    partitionKey,
    rowKey,
    recaptchaResult.score
  );
  context.bindings.commentsTableBinding = [entity];

  if (recaptchaResult.score < settings.minRecaptchaScore) {
    context.bindings.moderationQueue = createQueueMessage();
  } else {
    context.bindings.sentimentQueue = createQueueMessage();
  }

  context.res = {
    status: 201, // Created
    body: { rowKey: rowKey },
    headers: {
      "Content-Type": "application/json"
    }
  };

  function createQueueMessage() {
    return queueMessage(partitionKey, rowKey);
  }
};

async function verifyCaptcha(token, log) {
  const settings = getSettings();
  const verify = recaptcha.newVerifier(
    settings.recaptchaUrl,
    settings.recaptchaSecret
  );
  const result = await verify(token);
  log(result);
  return result;
}

function getMalformedRequestErrorMessage() {
  const sampleJson = JSON.stringify({
    captchaToken: "whateverToken",
    postUrl: "someUrl",
    authorName: "Michael Knight",
    text: "Some valuable text"
  });

  return "Request body must be some JSON like " + sampleJson;
}

function validateBodyIsComment(body) {
  return (
    body && body.postUrl && body.text && body.authorName && body.captchaToken
  );
}

function createEntity(body, partitionKey, rowKey, recaptchaScore) {
  const entity = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    text: body.text,
    authorName: body.authorName,
    "createdTimestampUtc@odata.type": "Edm.DateTime",
    createdTimestampUtc: new Date(body.createdTimestampUtc),
    recaptchaScore: recaptchaScore
  };
  if (body.parentRowKey) {
    entity.parentRowKey = body.parentRowKey;
  }
  if (body.email) {
    entity.email = body.email;
  }
  return entity;
}

// interface GrecaptchaResult {
//   success: boolean; // whether this request was a valid reCAPTCHA token for your site
//   score: number; // the score for this request (0.0 - 1.0)
//   action: string; // the action name for this request (important to verify)
//   challenge_ts: string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
//   hostname: string; // the hostname of the site where the reCAPTCHA was solved
//   "error-codes": []; // optional
// }
