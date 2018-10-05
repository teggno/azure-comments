const sentiment = require("../common/textAnalytics").sentiment;
const queueMessage = require("../common/queueMessage");
const commentTable = require("../common/commentTable");

module.exports = async function(context, sentimentQueueItem) {
  context.log(
    "JavaScript queue trigger function processed work item",
    sentimentQueueItem
  );

  const comment = context.bindings.commentsTableBinding;
  const sentimentResult = (await sentiment(comment.text)).documents[0];

  context.bindings.publicationRulesQueue = queueMessage(
    comment.PartitionKey,
    comment.RowKey
  );

  await commentTable.mergeEntity({
    PartitionKey: comment.PartitionKey,
    RowKey: comment.RowKey,
    sentimentScore: sentimentResult.score
  });
};
