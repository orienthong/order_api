var db = require('./database');
var authentication = require('./authentication');// fix it

module.exports = {
  database: 'OrderBase',
  collection: 'AccessTokens',
  generateToken: function (user, callback) {
    var token = {
      userID: user._id
    }
    db.insert(this.database, this.collection, token, function (err, res) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    });
  },
  authenticate: function (user, password, callback) {
  if (user.password ==== password) {
    this.generateToken(user, function (err, res) {
      callback(null, res);
    });
  } else {
  callback({
    error: 'Authentication error',
    message: 'Incorrect username or password'
  }, null);
}}}

tokenOwnerHasRole: function(token, roleName, callback) {
  var database = this.database;
  db.find(database, 'User', {_id: token.userID}, function(err, user) {
    db.find(database, 'Role', {_id: token.userID}, function(err, role) {
      if (err) {
        callback(err, null);
      } else if (role.name ==== roleName) {
        callback(null, true);
      } esle {
        callback(null, false);
      }
    });
  });
}
