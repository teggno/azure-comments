const getSettings = require("../common/settings").getSettings;
const queueMessage = require("../common/queueMessage");
const commentTable = require("../common/commentTable");

module.exports = async function(context, publicationRulesQueueItem) {
  context.log(
    "JavaScript queue trigger function processed work item",
    publicationRulesQueueItem
  );

  const settings = getSettings();
  const comment = context.bindings.commentsTableBinding;

  // the order in this array matters
  const stages = [
    {
      isCurrent: comment => isNullOrUndefined(comment.recaptchaScore),
      execute: () => {
        // isn't called because the recaptchaScore has been set in NewComment/index.js
        throw new Error("recaptchaScore must have a value at this stage");
      }
    },
    {
      isCurrent: comment => isNullOrUndefined(comment.sentimentScore),
      execute: () => {
        // sentimentScore is not set, so recaptchaScore has just been set, so process recaptchaScore
        if (comment.recaptchaScore < settings.minRecaptchaScore) {
          console.log(
            `Comment's recaptcha score of ${
              comment.recaptchaScore
            } is below threshold. Queuing comment for moderation.`,
            publicationRulesQueueItem
          );
          context.bindings.moderationQueue = createQueueMessage();
          return;
        }
        context.bindings.sentimentQueue = createQueueMessage();
      }
    },
    {
      isCurrent: comment => isNullOrUndefined(comment.keyPhrases),
      execute: () => {
        // keyPhrases is not set, so sentimentScore has just been set, so process sentimentScore
        if (comment.sentimentScore < settings.minSentimentScore) {
          console.log(
            `Comment's sentiment score of ${
              comment.sentimentScore
            } is below threshold. Queuing comment for moderation.`,
            publicationRulesQueueItem
          );
          context.bindings.moderationQueue = createQueueMessage();
          return;
        }
        context.bindings.keyPhrasesQueue = createQueueMessage();
      }
    },
    {
      isCurrent: () => true,
      execute: async () => {
        // keyPhrases has been set as the last field, so process keyPhrases
        if (comment.keyPhrases.length < settings.minKeyphrases) {
          console.log(
            `Comment has ${
              comment.keyPhrases.length
            } keyPhrases which is below threshold. Queuing comment for moderation.`,
            publicationRulesQueueItem
          );
          context.bindings.moderationQueue = createQueueMessage();
          return;
        }

        // const keyPhrasesOfPost = [];
        // const keyPhrasesOfComment = keyPhrasesOfCommentResultRaw.keyPhrases;
        // const matches = intersect(
        //   keyPhrasesOfComment.map(p => p.toLowerCase()),
        //   keyPhrasesOfPost.map(p => p.toLowerCase())
        // );
        // if (matches.length < settings.minKeyphraseIntersections) {
        // console.log(
        //   `Comment has ${
        //     matches.length
        //   } keyPhrases which also occur in the post which is below threshold. Queuing comment for moderation.`,
        //   publicationRulesQueueItem
        // );
        //   context.bindings.moderationQueue = createQueueMessage();
        //   return;
        // }

        // make comment visible
        await commentTable.mergeEntity({
          PartitionKey: comment.PartitionKey,
          RowKey: comment.RowKey,
          public: true
        });
        context.log(
          "Comment has been made public without moderation.",
          publicationRulesQueueItem
        );
      }
    }
  ];

  const stageToExecute = stages.filter(stage => stage.isCurrent(comment))[0];
  stageToExecute.execute();

  function createQueueMessage() {
    return queueMessage(comment.PartitionKey, comment.RowKey);
  }

  function isNullOrUndefined(value) {
    return typeof value === "undefined" || value === null;
  }
};

function intersect(a, b) {
  return a.filter(aa => b.some(bb => aa === bb));
}
