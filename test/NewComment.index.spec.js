const mocks = require("./mocks");
const sinon = require("sinon");
const recaptcha = require("../common/recaptcha");
const settings = require("../common/settings");
const expect = require("chai").expect;

describe("NewComment", () => {
  let getSettingsStub;
  before(() => {
    const s = settings.getSettings();
    s.recaptchaSkip = false;
    getSettingsStub = sinon.stub(settings, "getSettings");
    getSettingsStub.callsFake(() => s);
  });

  after(() => {
    getSettingsStub.restore();
  });

  it("should generate a 202 if all good", async () => {
    const recaptchaStub = sinon.stub(recaptcha, "newVerifier");
    recaptchaStub.callsFake(() => () => ({ success: true, score: 0.9 }));

    let req = {
      body: mocks.newComments.validRequestBody()
    };

    const context = mocks.newComments.context();
    const sut = require("../NewComment");
    await sut(context, req);
    expect(context.res.status).to.be.equal(202);

    recaptchaStub.restore();
  });

  it("should generate a 400 if captcha not valid", async () => {
    const recaptchaStub = sinon.stub(recaptcha, "newVerifier");
    recaptchaStub.callsFake(() => () => ({ success: false }));

    let req = {
      body: mocks.newComments.validRequestBody()
    };

    const context = mocks.newComments.context();
    const sut = require("../NewComment");
    await sut(context, req);
    expect(context.res.status).to.be.equal(400);

    recaptchaStub.restore();
  });

  it("should generate a 400 if required fields are missing in request body JSON", async () => {
    const recaptchaStub = sinon.stub(recaptcha, "newVerifier");
    recaptchaStub.callsFake(() => () => ({ success: true }));

    const sut = require("../NewComment");

    const requiredFields = ["postUrl", "authorName", "text", "captchaToken"];
    const statusList = await Promise.all(
      requiredFields.map(async field => {
        const context = mocks.newComments.context();
        await sut(context, { body: requestBodyWithMissingField(field) });
        return context.res.status;
      })
    );

    expect(statusList).to.eql(requiredFields.map(() => 400));

    recaptchaStub.restore();
  });
});

function requestBodyWithMissingField(name) {
  const body = mocks.newComments.validRequestBody();
  delete body[name];
  return body;
}
