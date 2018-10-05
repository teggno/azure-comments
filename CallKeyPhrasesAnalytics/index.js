const getSettings = require("../common/settings").getSettings;
const keyPhrases = require("../common/textAnalytics").keyPhrases;
const queueMessage = require("../common/queueMessage");
const commentTable = require("../common/commentTable");

module.exports = async function(context, keyPhrasesQueueItem) {
  context.log(
    "JavaScript queue trigger function processed work item",
    keyPhrasesQueueItem
  );

  const comment = context.bindings.commentsTableBinding;
  const keyPhrasesOfCommentResult = (await keyPhrases(comment.text)).documents[0];
  const keyPhrasesOfComment = keyPhrasesOfCommentResult.keyPhrases;

  await commentTable.mergeEntity({
    PartitionKey: comment.PartitionKey,
    RowKey: comment.RowKey,
    keyPhrases: JSON.stringify(keyPhrasesOfComment)
  });

  const settings = getSettings();
  if (keyPhrasesOfComment.length < settings.minKeyphrases) {
    context.bindings.moderationQueue = queueMessage(
      comment.PartitionKey,
      comment.RowKey
    );
    return;
  }

  // const keyPhrasesOfPost = [];
  // const keyPhrasesOfComment = keyPhrasesOfCommentResultRaw.keyPhrases;
  // const matches = intersect(
  //   keyPhrasesOfComment.map(p => p.toLowerCase()),
  //   keyPhrasesOfPost.map(p => p.toLowerCase())
  // );

  // if (matches.length < settings.minKeyphraseIntersections) {
  //   context.bindings.moderationQueue = queueMessage(
  //     comment.PartitionKey,
  //     comment.RowKey
  //   );
  //   return;
  // }

  // make comment visible
  await commentTable.mergeEntity({
    PartitionKey: comment.PartitionKey,
    RowKey: comment.RowKey,
    public: true
  });

};

function intersect(a, b) {
  return a.filter(aa => b.some(bb => aa === bb));
}
