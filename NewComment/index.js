const recaptcha = require("./recaptcha").default;

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
    !getSetting("recaptcha_skip") &&
    !(await verifyCaptcha(req.body.captchaToken))
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

async function verifyCaptcha(token) {
  const verify = recaptcha(
    getSetting("recaptcha_url"),
    getSetting("recaptcha_secret")
  );
  const result = await verify(token);
  return !!result.success;
}

function getSetting(name) {
  return process.env[name];
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
  return body && body.postUrl && body.text && body.authorName;
}

function createEntity(body, rowKey) {
  return {
    PartitionKey: body.postUrl,
    RowKey: rowKey,
    text: body.text,
    authorName: body.authorName
  };
}
