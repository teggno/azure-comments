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
