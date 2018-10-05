module.exports = async function(context, moderationQueueItem) {
  context.log(
    "JavaScript queue trigger function processed work item",
    moderationQueueItem
  );
};
