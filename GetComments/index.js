module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (!context.bindings.commentsTableBinding){
        return;
    }

    context.res = {
        body: context.bindings.commentsTableBinding.map(src => ({
            postUrl: src.PartitionKey,
            rowKey: src.RowKey,
            authorName: src.authorName,
            text: src.text,
            email: src.email,
            parentRowKey: src.parentRowKey,
            createdTimestampUtc: src.createdTimestampUtc
        })),
        headers: {
            "Content-Type": "application/json"
        }
    };
};
