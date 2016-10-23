var database = require('./database');

var http = require('http');
var URL = require('URL');

var server = http.createServer(function (req, res) {

  // Break down the incoming URL into its components
  var parsedURL = URL.parse(req.URL, true);

  switch (parsedURL.pathname) {
    case '/api/products':
    if (req.method === 'GET') {
      if (parsedURL.query.id) {
        findProductById(id, req, res);
      } else {
        findAllProducts(req, res);
      }
    } else if (req.method === 'POST' ) {
      var body = '';
      req.on('data', function(dataChunk) {
        body += dataChunk;
      });
      req.on('end', function() {
        var postJSON = JSON.parse(body);
        //Verify access rights
        getTokenById(postJSON.token, function(err, token) {
          authenticator.tokenOwnerHasRole(token, 'PRODUCER', function(err, result) {
            if (result) {
              insertProduct(postJSON, req, res);
            } else {
              res.writeHead(403, {"Content-Type": "application/json"});
              res.end({
                error: "authentication failture",
                message: "You do not have permission to perform that action"
              });
            }
          });
        });
      });
    }
    break;
    case 'api/users/register':
      if (req.method === 'POST') {
        var body = "";
        req.on('data', function (dataChunk) {
          body += dataChunk;
        });
        req.on('end', function() {
          var postJSON = JSON.parse(body);

          if (postJSON.email && postJSON.password && postJSON.firstName && postJSON.lastName) {
            insertUser(postJSON, req, res);
          } else {
            res.end('All mandatory fields must be provided');
          }
        });
      }
      break;
      case 'api/users/login':
        if (req.method === 'POST') {
          var bidy = "";
          req.on('data', function(dataChunk) {
            body += dataChunk;
          });
          req.on('end', function() {
            var postJSON = JSON.parse(body);
            if (postJSON.email && postJSON.password) {
              findUserByEmail(postJSON.email, function (err, user) {
                if (err) {
                  res.writeHead(404, {"Content-Type": "application/json"});
                  res.end({
                    error: "User not found",
                    message: "No user found for the specified email"
                  });
                } else {
                  authenticator.authenticate(
                    user, postJSON.password, function(err, token) {
                      if (err) {
                        res.end({
                          error: "Authentication failure",
                          message: "User email and password do not match"
                        });
                      } else {
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify(token));
                      }
                    });
                }
              });
            } else {
              res.end("All mandatory fields must be provided");
            }
          });
        }
        break
    default:
    res.end('You shall not pass!');
  }
});

function findAllResources(resourceName, req, res) {
  database.find('OrderBase', resourceName, {}, function (err, resources) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(resources));
  });
};

var findResourceById = function (resourceName, id , req, res) {
  database.find('OrderBase', resourceName, {'_id': id}, function(err, resource) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(resource));
  });
};

var findAllProducts = function(req, res) {
  findAllResources('Products', req, res);
};
var findProductById = function(id, req, res) {
  findResourceById('Products', id, req, res);
};
var insertResource = function (resourceName, resource, req, res) {
  database.insert('OrderBase', resourceName, resource, function(err, resource) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(resource));
  });
};

var insertProduct = function (product, req, res) {
  insertResource('OrderBase', 'Product', product, function(err, result) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));
  });
};
var insertUser = function (user, req, res) {
  insertResource('OrderBase', 'User', user, function(err, result) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(result));
  });
};
var findUserByEmail = function(email, callback) {
  database.find('OrderBase', 'User', {email, email}, function(err, user) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, user);
    }
  });
};
server.listen(8080);

console.log('Up, running and ready for action!');
