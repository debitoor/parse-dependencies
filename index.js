var fs = require('fs');
var async = require('async');
var builtin = process.binding('natives')
var getDirname = require('path').dirname;

function parse(src) {
	var re = /require\((['"])(.*)\1\)/g;
	var deps = [];
	var match;
	while ((match = re.exec(src))) {
		deps.push(match[2]);
	}
	return deps;
}

function group(file, deps) {
	var dir = getDirname(file);
	var notBuildin = deps.filter(function (item) {
		return !(item in builtin);
	});
	var internal = notBuildin
		.filter(function (item) {
			return item[0] === '.';
		})
		.map(function (item) {
			return dir + '/' + item;
		});
	var external = notBuildin
		.filter(function (item) {
			return item[0] !== '.';
		})
		.map(function (item) {
			return item.split('/')[0];
		});
	return {
		internal: internal,
		external: external
	};
}

function find(file, cb) {
	var resolved = [];
	return resolve(file, cb);

	function resolve(file, cb) {
		var path = require.resolve(file);
		if (resolved.indexOf(path) !== -1) {
			return cb(null, []);
		}
		resolved.push(path);

		fs.readFile(path, function (err, src) {
			if (err) {
				return cb(err);
			}

			var deps = parse(src.toString());
			var groups = group(path, deps);

			async.mapLimit(groups.internal, 10, resolve, function (err, result) {
				if (err) {
					return cb(err);
				}
				var uniqDeps = Array.prototype.concat.apply(groups.external, result)
					.filter(function (item, index, arr) {
						return arr.indexOf(item) === index; // only uniq items
					});
				cb(null, uniqDeps);
			});
		});
	}
}

module.exports = find;
