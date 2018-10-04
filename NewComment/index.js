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

  const rowKey = context.bindingData.sys.randGuid;
  const entity = createEntity(req.body, rowKey);
  context.bindings.commentsTableBinding = [entity];

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

function createEntity(body, rowKey) {
  var entity = {
    PartitionKey: body.postUrl,
    RowKey: rowKey,
    text: body.text,
    authorName: body.authorName,
    createdTimestampUtc: body.createdTimestampUtc
  };
  if (body.parentRowKey) {
    entity.parentRowKey = body.parentRowKey;
  }
  if (body.email) {
    entity.email = body.email;
  }
  return entity;
}
