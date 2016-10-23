var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');

/**
*
* @param databaseName - name of the database we are connecting to
* @param callBack - callback to execute when connection finishes
*/
var connect = function (databaseName, callback) {
  var url = 'mongodb://localhost:27017/'+ databaseName;

  MongoClient.connect(url, function(error, database) {
    // Make sure that no error was thrown
    assert.equal(null, error);
    console.log("Successfully connected to MongoDB instance!");

    callback(database);
  })
};
/**
* Executes the find() method of the target collection in the
* target database, optionally with a query.
* @param databaseName - name of the database
* @param collectionName - name of the collection
* @param query - optional query parameters for find()
*/
exports.find = function (databaseName, collectionName, query) {
  connect(databaseName, function(database) {
    // The collection we want to find documents from
    var collection = database.collection(collectionName);
    // Search the given collection in the given database for
    // all documents which match the criteria, convert them to
    // an array, and finally execute a callback on them.
    collection.find(query).toArray(
      function (err, documents) {
        assert.equal(err, null);
        // Print all the documents that we found, if any
        console.log("MongoDB returned the followingdocuments:");
        console.dir(documents);
        // Close the database connection to free resources
        database.close();
      }
    )
  })
}
