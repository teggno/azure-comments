module.exports = function(partitionKey, rowKey) {
  // Get a serialized reference to the comment table entity to put into some queue.
  // Actually RowKey alone is already unique but queries to the table are faster
  // when the Partition Key is included so we store it in the queue message too.
  return JSON.stringify({
    PartitionKey: partitionKey,
    RowKey: rowKey
  });
};
