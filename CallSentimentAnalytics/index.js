const getSettings = require("../common/settings").getSettings;
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

  await commentTable.mergeEntity({
    PartitionKey: comment.PartitionKey,
    RowKey: comment.RowKey,
    sentimentScore: sentimentResult.score
  });

  const settings = getSettings();
  if (sentimentResult.score < settings.minSentimentScore){
    context.bindings.moderationQueue = queueMessage(comment.PartitionKey, comment.RowKey);
  }
  else{
    context.bindings.keyPhrasesQueue = queueMessage(comment.PartitionKey, comment.RowKey);
  }
};
