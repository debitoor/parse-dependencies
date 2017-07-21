# parse-dependencies
Fast and easy way to get dependencies for your code.

[![npm version](https://badge.fury.io/js/parse-dependencies.svg)](http://badge.fury.io/js/parse-dependencies) [![Build Status](https://travis-ci.org/debitoor/parse-dependencies.svg?branch=master)](https://travis-ci.org/debitoor/parse-dependencies) [![Dependency Status](https://david-dm.org/debitoor/parse-dependencies.svg)](https://david-dm.org/debitoor/parse-dependencies) [![devDependency Status](https://david-dm.org/debitoor/parse-dependencies/dev-status.svg)](https://david-dm.org/debitoor/parse-dependencies#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/debitoor/parse-dependencies/badge.svg?branch=master&service=github)](https://coveralls.io/github/debitoor/parse-dependencies?branch=master)

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
    console.log('oops. You have missing depencies\n%s', diff.join());
  }
});
```
