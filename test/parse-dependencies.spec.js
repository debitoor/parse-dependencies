const expect = require('chai').expect;
const parse = require('../index');

describe('parse-dependencies', () => {
	let deps;

	before((done) => {
		parse(__dirname + '/mock/main.js', (err, parsedDeps) => {
			deps = parsedDeps;
			done();
		});
	});

	it('should return dependencies from main file and its internal dependencies', () => {
		expect(deps).to.include.members(['express', 'body-parser', 'lodash', 'async']);
	});

	it('should return unique dependencies', () => {
		expect(deps.indexOf('lodash')).to.eql(deps.lastIndexOf('lodash'));
	});

	it('should ignore commented dependencies', () => {
		expect(deps).to.not.include.members(['commented', 'another-commented']);
	});
});
