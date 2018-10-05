const keyPhrases = require("../common/textAnalytics").keyPhrases;
const commentTable = require("../common/commentTable");
const queueMessage = require("../common/queueMessage");

module.exports = async function(context, keyPhrasesQueueItem) {
  context.log(
    "JavaScript queue trigger function processed work item",
    keyPhrasesQueueItem
  );

  const comment = context.bindings.commentsTableBinding;
  const keyPhrasesOfCommentResult = (await keyPhrases(comment.text))
    .documents[0];
  const keyPhrasesOfComment = keyPhrasesOfCommentResult.keyPhrases;

  await commentTable.mergeEntity({
    PartitionKey: comment.PartitionKey,
    RowKey: comment.RowKey,
    keyPhrases: JSON.stringify(keyPhrasesOfComment)
  });

  context.bindings.publicationRulesQueue = queueMessage(
    comment.PartitionKey,
    comment.RowKey
  );
};
