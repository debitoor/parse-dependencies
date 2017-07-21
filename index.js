const fs = require('fs');
const normalize = require('path').normalize;
const async = require('async');
const builtin = process.binding('natives');
const getDirname = require('path').dirname;

function parse(src) {
	const commentRegexp = /\/\*(.*?)\*\/|\/\/(.*?)(\n|$)/g;
	const dependencyRegexp = /require\((['"])(.*)\1\)/g;

	src = src.replace(commentRegexp, '');
	const deps = [];
	let match;
	while ((match = dependencyRegexp.exec(src))) {
		deps.push(match[2]);
	}
	return deps;
}

function group(file, deps) {
	const dir = getDirname(file);
	const notBuildin = deps.filter(function (item) {
		return !(item in builtin);
	});
	const internal = notBuildin
		.filter(function (item) {
			return item[0] === '.';
		})
		.map(function (item) {
			return dir + '/' + item;
		})
		.map(normalize);
	const external = notBuildin
		.filter(function (item) {
			return item[0] !== '.';
		})
		.map(function (item) {
			return item.split('/')[0];
		})
		.map(normalize);

	return {
		internal: internal,
		external: external
	};
}

function find(file, cb) {
	const resolved = [];
	return resolve(normalize(file), cb);

	function resolve(file, cb) {
		let path;
		try {
			path = require.resolve(file);
		} catch (e) {
			return cb(e);
		}
		if (resolved.indexOf(path) !== -1) {
			return cb(null, []);
		}
		resolved.push(path);

		fs.readFile(path, function (err, src) {
			if (err) {
				return cb(err);
			}

			const deps = parse(src.toString());
			const groups = group(path, deps);

			async.mapLimit(groups.internal, 10, resolve, function (err, result) {
				if (err) {
					return cb(new Error(err.message + ' at ' + file));
				}
				const uniqDeps = Array.prototype.concat.apply(groups.external, result)
					.filter(function (item, index, arr) {
						return arr.indexOf(item) === index; // only uniq items
					});
				cb(null, uniqDeps);
			});
		});
	}
}

module.exports = find;
