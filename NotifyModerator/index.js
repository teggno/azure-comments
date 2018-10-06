const sendMail = require("../common/email");
const getSettings = require("../common/settings").getSettings;
const generateCommentKey = require("../common/commentKey").generateKey;
const commentTable = require("../common/commentTable");

module.exports = async function(context, moderationQueueItem) {
  context.log(
    "NotifyModerator function processing message ",
    moderationQueueItem
  );

  const settings = getSettings();

  const comment = context.bindings.commentsTableBinding;
  comment.unauthenticatedModerationToken = context.bindingData.sys.randGuid;


  // Add unauthenticatedModerationToken. Only comments that have that
  // can be moderated using a link only without login.
  await commentTable.mergeEntity({
    PartitionKey: comment.PartitionKey,
    RowKey: comment.RowKey,
    unauthenticatedModerationToken: comment.unauthenticatedModerationToken
  });

  const key = generateCommentKey(comment);

  const mailOptions = {
    to: settings.moderatorEmail,
    subject: "New comment needs moderation",
    html:
      "A new comment has been posted that needs moderation. " +
      `<a href="${settings.moderateCommentPageUrl(
        key
      )}">Click here to moderate.</a>`
  };

  await sendMail(mailOptions);
};
