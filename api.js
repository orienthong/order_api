var database = require('./database');

var http = require('http');
var URL = require("url");

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
        insertProduct(postJSON, req, res);
      });
    }
    break;
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


server.listen(8080);

console.log('Up, running and ready for action!');
