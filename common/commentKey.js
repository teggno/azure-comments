module.exports.generateKey = function(comment) {
  const source = JSON.stringify({
    PartitionKey: comment.PartitionKey,
    RowKey: comment.RowKey,
    unauthenticatedModerationToken: comment.unauthenticatedModerationToken
  });
  const buffer = new Buffer(source);
  return buffer.toString("base64");
};

module.exports.parseKey = function(key) {
  const buffer = new Buffer(key, "base64");
  const json = buffer.toString("utf8");
  return JSON.parse(json);
};
