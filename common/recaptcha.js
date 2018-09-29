const request = require("https").request;

exports.newVerifier = function(googleUrl, secret) {
  return async function(token, remoteIP) {
    let requestBody = `secret=${secret}&response=${token}`;
    if (remoteIP) requestBody += `&remoteip=${remoteIP}`;
    const postOptions = {
      path: googleUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(requestBody)
      }
    };

    const verficationResponse = await promisedRequest(postOptions, requestBody);
    const result = JSON.parse(verficationResponse);
    return result;
  };
};

function promisedRequest(options, requestBody) {
  return new Promise((resolve, reject) => {
    const req = request(options, response => {
      let responseBody = "";

      response.on("data", chunk => (responseBody += chunk));
      response.on("end", () => resolve(responseBody));
      response.on("error", err => reject(error));
    });
    if (typeof requestBody !== "undefined") req.write(requestBody);
    req.end();
  });
}
