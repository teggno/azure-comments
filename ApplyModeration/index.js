const commentTable = require("../common/commentTable");
const parseCommentKey = require("../common/commentKey").parseKey;

module.exports = async function(context, req) {
  if (!req.query.key) {
    context.res = {
      status: 400,
      body: "Please pass a key on the query string"
    };
    return;
  }

  const keyParsed = parseCommentKey(req.query.key);
  const comment = await commentTable.getComment(
    keyParsed.PartitionKey,
    keyParsed.RowKey
  );
  if (
    !comment ||
    comment.unauthenticatedModerationToken !==
      keyParsed.unauthenticatedModerationToken
  ) {
    context.res = {
      status: 404,
      body: "Comment not found"
    };
    return;
  }

  comment["createdTimestampUtc@odata.type"] = "Edm.DateTime";
  delete comment.unauthenticatedModerationToken;

  if (req.body.accepted) {
    comment.public = true;
    await commentTable.replaceEntity(comment);
  } else {
    await commentTable.replaceEntity(comment);
  }

  context.res = {
    status: 204
  };
};
