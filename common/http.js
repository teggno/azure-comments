const request = require("https").request;

exports.promisedHttpsRequest = function(options, requestBody) {
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
