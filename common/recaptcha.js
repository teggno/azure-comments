const url = require("url");
const promisedHttpsRequest = require("./http").promisedHttpsRequest;

exports.newVerifier = function(googleUrl, secret) {
  return async function(token, remoteIP) {
    let requestBody = `secret=${secret}&response=${token}`;
    if (remoteIP) requestBody += `&remoteip=${remoteIP}`;
    const urlObj = url.parse(googleUrl);
    const postOptions = {
      method: "POST",
      path: urlObj.pathname,
      host: urlObj.hostname,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(requestBody)
      }
    };

    const verficationResponse = await promisedHttpsRequest(postOptions, requestBody);
    const result = JSON.parse(verficationResponse);
    return result;
  };
};
