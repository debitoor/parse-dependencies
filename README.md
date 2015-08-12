# parse-dependencies
Fast and easy way to get dependencies for your code.

## Install
    npm instal --save parse-dependencies

## Usage
```js
var parse = require('parse-dependencies');
parse(__dirname + '/server.js', function (err, deps) {
  console.log(deps); // 'express', 'body-parser' ...
});
```

You can compare result with you production dependencies
```js
var parse = require('parse-dependencies');
var packageDeps = require('./package').dependencies;

parse(__dirname + '/server.js', function (err, deps) {
  var diff = deps.filter(function (item) {
    return !(item in packageDeps);
  });
  if (diff.length) {
    console.log('oops. You have missing depencies');
  }
});
```
