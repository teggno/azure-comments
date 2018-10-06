const commentTable = require("../common/commentTable");
const parseCommentKey = require("../common/commentKey").parseKey;

module.exports = async function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  if (!req.query.key) {
    context.res = create400Response();
    return;
  }

  let parsedKey;
  try {
    parsedKey = parseCommentKey(req.query.key);
  } catch (err) {
    context.res = create400Response();
    return;
  }
  const comment = await commentTable.getComment(
    parsedKey.PartitionKey,
    parsedKey.RowKey
  );

  // also check the unauthenticatedModerationToken as a security measure. This makes sure
  // it's not possible to guess a key from an unknown comment in case the code
  // is changed so that the RowKey wouldn't be a guid any more.
  if (comment.unauthenticatedModerationToken === parsedKey.unauthenticatedModerationToken) {
    context.res = {
      body: JSON.stringify(comment),
      headers: {
        "Content-Type": "application/json"
      }
    };
    return;
  }

  context.res = create404Response();
};

function create400Response() {
  return {
    status: 400,
    body:
      "Query string must contain a key parameter which is a base 64 encoded JSON object like { PartitionKey, RowKey, unauthenticatedModerationToken }."
  };
}

function create404Response() {
  return {
    status: 404,
    body: "Unknown or invalid key."
  };
}
