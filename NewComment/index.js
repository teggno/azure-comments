const recaptcha = require("../common/recaptcha");
const getSettings = require("../common/settings").getSettings;

module.exports = async function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");
  if (!validateBodyIsComment(req.body)) {
    context.res = {
      status: 400,
      body: getMalformedRequestErrorMessage()
    };
    return;
  }
  if (
    !getSettings().recaptchaSkip &&
    !(await verifyCaptcha(req.body.captchaToken, context.log))
  ) {
    context.res = {
      status: 400,
      body: "Captcha rejected."
    };
    return;
  }

  const partitionKey = req.body.postUrl;
  const rowKey = context.bindingData.sys.randGuid;
  const entity = createEntity(req.body, partitionKey, rowKey);
  context.bindings.commentsTableBinding = [entity];

  // Store the reference to the new table entity in the queue. Actually RowKey alone
  // is already unique but queries to the table are faster when the Partition Key is
  // included so we store it in the queue message too.
  context.bindings.textanalyticsQueue = JSON.stringify({
    PartitionKey: partitionKey,
    RowKey: rowKey
  });

  context.res = {
    status: 201, // Created
    body: { rowKey: rowKey },
    headers: {
      "Content-Type": "application/json"
    }
  };
};

async function verifyCaptcha(token, log) {
  var settings = getSettings();
  const verify = recaptcha.newVerifier(
    settings.recaptchaUrl,
    settings.recaptchaSecret
  );
  const result = await verify(token);
  log(result);
  return !!result.success;
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

function createEntity(body, partitionKey, rowKey) {
  var entity = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    text: body.text,
    authorName: body.authorName,
    createdTimestampUtc: new Date(body.createdTimestampUtc)
  };
  if (body.parentRowKey) {
    entity.parentRowKey = body.parentRowKey;
  }
  if (body.email) {
    entity.email = body.email;
  }
  return entity;
}
