const azure = require("azure-storage");
const getSettings = require("./settings").getSettings;

exports.mergeEntity = function(comment) {
  const tableService = azure.createTableService(
    getSettings().storageConnectionString
  );
  return new Promise((resolve, reject) => {
    tableService.mergeEntity("Comments", comment, function(
      error,
      result,
      response
    ) {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
};

exports.getComment = function(partitionKey, rowKey) {
  const tableService = azure.createTableService(
    getSettings().storageConnectionString
  );
  return new Promise((resolve, reject) => {
    tableService.retrieveEntity("Comments", partitionKey, rowKey, function(
      error,
      result,
      response
    ) {
      if (error) {
        reject(error);
        return;
      }
      var comment = {};
      Object.keys(result).forEach(name => {
        if (name === "Timestamp" || name === "etag")return;
        comment[name] = result[name]._;
      });
      comment.createdTimestampUtc = comment.createdTimestampUtc.toJSON();
      resolve(comment);
    });
  });
};
