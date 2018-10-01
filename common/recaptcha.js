const request = require("https").request;
const url = require('url');

exports.newVerifier = function(googleUrl, secret) {
  return async function(token, remoteIP) {
    let requestBody = `secret=${secret}&response=${token}`;
    if (remoteIP) requestBody += `&remoteip=${remoteIP}`;
    var urlObj = url.parse(googleUrl);
    const postOptions = {
      method: "POST",
      path: urlObj.pathname,
      host: urlObj.hostname,
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
      response.on("error", err => reject(err));
    });
    req.on("error", err => reject(err));
    if (typeof requestBody !== "undefined") req.write(requestBody);
    req.end();
  });
}
