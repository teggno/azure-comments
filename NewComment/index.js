module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    if (!validateBodyIsComment(req.body)){
        const sampleJson = JSON.stringify({ 
            captchaToken: "whateverToken", 
            postUrl: "someUrl", 
            authorName: "Michael Knight",
            text: "Some valuable text"});

        context.res = {
            status: 400,
            body: "Request body must be some JSON like " + sampleJson
        };
        return;
    }
    if (!await verifyCaptcha(req.body.captchaToken)){
        context.res = {
            status: 400,
            body: "Captcha verification failed."
        };
        return;
    }

    const rowKey = context.bindingData.sys.randGuid;
    const entity = createEntity(req.body, rowKey);
    context.bindings.commentsTableBinding = [entity];

    context.res = {
        status: 201, // Created
        body: { rowKey: rowKey },
        headers: {
            "Content-Type": "application/json"
        }
    };
};

async function verifyCaptcha(token){
    return true;
}

function validateBodyIsComment(body){
    return body
        && body.postUrl
        && body.text
        && body.authorName;
}

function createEntity(body, rowKey){
    return { 
        PartitionKey: body.postUrl,
        RowKey: rowKey,
        text: body.text,
        authorName: body.authorName
    }
}