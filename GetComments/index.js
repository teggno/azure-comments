module.exports = async function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  if (!context.bindings.commentsTableBinding) {
    return;
  }

  context.res = {
    // NOTE: the email is deliberately excluded here because this is the
    // unauthenticated API for getting the comment list.
    body: context.bindings.commentsTableBinding.map(src => ({
      postUrl: src.PartitionKey,
      rowKey: src.RowKey,
      authorName: src.authorName,
      text: src.text,
      parentRowKey: src.parentRowKey,
      createdTimestampUtc: src.createdTimestampUtc
    })),
    headers: {
      "Content-Type": "application/json"
    }
  };
};
