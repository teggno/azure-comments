exports.newComments = {
  validRequestBody: () => ({
    captchaToken: "whateverToken",
    postUrl: "someUrl",
    authorName: "Michael Knight",
    text: "Some valuable text"
  }),
  context: () => ({
    log: () => {},
    bindingData: { sys: { randGuid: "" } },
    bindings: { }
  })
};

