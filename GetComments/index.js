module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // if (!req.query.postUrl) {
    //     context.res = {
    //         status: 400,
    //         body: "Must be a GET request with a postUrl query string parameter"
    //     };
    //     return;
    // }

    if (!context.bindings.commentsTableBinding){
        return;
    }

    context.res = {
        body: context.bindings.commentsTableBinding.map(src => ({
            postUrl: src.PartitionKey,
            rowKey: src.RowKey,
            authorName: src.authorName,
            text: src.text
        })),
        headers: {
            "Content-Type": "application/json"
        }
    };
};