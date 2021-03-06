var testHelpers = require('can-test-helpers');
var stache = require('../can-stache');
var DefineMap = require("can-define/map/map");
var Scope = require("can-view-scope");

QUnit.module("can-stache: warnings");


testHelpers.dev.devOnlyTest("lineNumber should be set on the scope inside of a rendered string (#415)", function() {
	var scope = new Scope({ foo: "classVal" });
	var template = stache("<div class='{{foo}}'>Hello</div>");
	template(scope);

	QUnit.equal(scope.get("scope.lineNumber"), 1);
});

testHelpers.dev.devOnlyTest("should not warn for keys that exist but are `undefined` (#427)", function () {
	var VM = DefineMap.extend({
		propWithoutValue: 'string'
	});
	var vm = new VM();
	var teardown = testHelpers.dev.willWarn('can-stache/expressions/lookup.js: Unable to find key "propWithoutValue".');

	stache('<li>{{propWithoutValue}}</li>')(vm);

	QUnit.equal(teardown(), 0, 'did not get warning');
});

testHelpers.dev.devOnlyTest("should not warn for dotted keys that exist", function () {
	var ENV = DefineMap.extend({
		NODE_ENV: "any"
	});

	var VM = DefineMap.extend({
		env: "any"
	});

	// First without anything
	var vm = new VM();
	var teardown = testHelpers.dev.willWarn(/Unable to find key/);
	stache('{{env.NODE_ENV}}')(vm);

	QUnit.equal(teardown(), 0, "did not warn");

	// Then with an env but no prop
	vm = new VM({env: new DefineMap()});
	teardown = testHelpers.dev.willWarn(/Unable to find key/);
	stache('{{env.NODE_ENV}}')(vm);

	QUnit.equal(teardown(), 1, "did warn");

	// Then with everything
	vm = new VM({env: new ENV()});
	teardown = testHelpers.dev.willWarn(/Unable to find key/);
	stache('{{env.NODE_ENV}}')(vm);

	QUnit.equal(teardown(), 0, "did not warn");
});

testHelpers.dev.devOnlyTest("should not warn for scope.<key> keys that exist", function () {
	var VM = DefineMap.extend({
		name: "string",
		list: {
			default: function() {
				return [ "one", "two" ];
			}
		}
	});

	var vm = new VM();
	var scope = new Scope(vm, null, { viewModel: true });
	var teardown = testHelpers.dev.willWarn(/Unable to find key/);
	stache('{{#each list}}{{scope.vm.name}}{{/each}}')(scope);

	QUnit.equal(teardown(), 0, "did not warn");
});

testHelpers.dev.devOnlyTest("should not warn for ../<key> keys that exist (#519)", function () {
	var VM = DefineMap.extend({
		name: "string",
		list: {
			default: function() {
				return [ "one", "two" ];
			}
		}
	});

	var vm = new VM();
	var scope = new Scope(vm, null, { viewModel: true });
	var teardown = testHelpers.dev.willWarn(/Unable to find key/);
	stache('{{#each list}}{{../name}}{{/each}}')(scope);

	QUnit.equal(teardown(), 0, "did not warn");
});

testHelpers.dev.devOnlyTest("Warnings for nested properties should not suggest using the same key (#536)", function () {
	var Abc = DefineMap.extend({});
	var VM = DefineMap.extend({
		abc: {
			Default: Abc
		}
	});

	var vm = new VM();
	var scope = new Scope(vm, null, { viewModel: true });
	var warningTeardown = testHelpers.dev.willWarn(/Unable to find key/);
	var suggestionTeardown = testHelpers.dev.willWarn(/will read from/);
	stache('{{abc.def}}')(scope);

	QUnit.equal(warningTeardown(), 1, "gave warning");
	QUnit.equal(suggestionTeardown(), 0, "did not give suggestions");
});

testHelpers.dev.devOnlyTest("Variable not found warning should suggest correct keys", function () {
	var origGetPaths = Scope.prototype.getPathsForKey;
	Scope.prototype.getPathsForKey = function(key) {
		var paths = {};
		paths["foo/" + key] = {};
		paths["../bar/" + key] = {};
		return paths;
	};

	var considerTeardown = testHelpers.dev.willWarn(/bar.stache:1: Unable to find key "name".* Did you mean one of these\?/);
	var fooOptionTeardown = testHelpers.dev.willWarn(/"foo\/name" which will read from/);
	var barOptionTeardown = testHelpers.dev.willWarn(/"..\/bar\/name" which will read from/);

	stache('bar.stache', '<p>{{#with user}}{{name}}{{/with}}</p>')({
		name: 'app',
		user: {}
	});

	QUnit.equal(considerTeardown(), 1, 'got expected warning');
	QUnit.equal(fooOptionTeardown(), 1, 'got foo/name option');
	QUnit.equal(barOptionTeardown(), 1, 'got ../bar/name option');

	Scope.prototype.getPathsForKey = function(key) {
		var paths = {};
		paths["../baz/" + key] = {};
		return paths;
	};

	considerTeardown = testHelpers.dev.willWarn(/bar.stache:1: Unable to find key "name".* Did you mean\?/);
	var bazOptionTeardown = testHelpers.dev.willWarn(/"..\/baz\/name" which will read from/);

	stache('bar.stache', '<p>{{#with user}}{{name}}{{/with}}</p>')({
		name: 'app',
		user: {}
	});

	QUnit.equal(considerTeardown(), 1, 'got expected warning');
	QUnit.equal(bazOptionTeardown(), 1, 'got baz/name option');

	Scope.prototype.getPathsForKey = origGetPaths;
});

testHelpers.dev.devOnlyTest("Variable not found warning should suggest correct keys for nested properties (#519)", function () {
	var origGetPaths = Scope.prototype.getPathsForKey;
	Scope.prototype.getPathsForKey = function(key) {
		var paths = {};
		paths["foo/name.first"] = {};
		paths["../bar/name.first"] = {};
		return paths;
	};

	var considerTeardown = testHelpers.dev.willWarn(/bar.stache:1: Unable to find key "name.first".* Did you mean one of these\?/);
	var fooOptionTeardown = testHelpers.dev.willWarn(/"foo\/name.first" which will read from/);
	var barOptionTeardown = testHelpers.dev.willWarn(/"..\/bar\/name.first" which will read from/);

	stache('bar.stache', '<p>{{#with user}}{{name.first}}{{/with}}</p>')({
		name: {},
		user: {}
	});

	QUnit.equal(considerTeardown(), 1, 'got expected warning');
	QUnit.equal(fooOptionTeardown(), 1, 'got foo/name option');
	QUnit.equal(barOptionTeardown(), 1, 'got ../bar/name option');

	Scope.prototype.getPathsForKey = origGetPaths;

});

testHelpers.dev.devOnlyTest("Variable not found warning should suggest correct keys for functions (#529)", function () {
	var origGetPaths = Scope.prototype.getPathsForKey;
	Scope.prototype.getPathsForKey = function(key) {
		var paths = {};
		if (key === "name") {
			paths["foo/" + key + "()"] = {};
			paths["../bar/" + key + "()"] = {};
		}
		return paths;
	};

	var considerTeardown = testHelpers.dev.willWarn(/bar.stache:1: Unable to find key "name\(\)".* Did you mean one of these\?/);
	var fooOptionTeardown = testHelpers.dev.willWarn(/"foo\/name\(\)" which will read from/);
	var barOptionTeardown = testHelpers.dev.willWarn(/"..\/bar\/name\(\)" which will read from/);

	stache('bar.stache', '<p>{{#with user}}{{name()}}{{/with}}</p>')({
		name: function() { return 'app'; },
		user: {}
	});

	QUnit.equal(considerTeardown(), 1, 'got expected warning');
	QUnit.equal(fooOptionTeardown(), 1, 'got foo/name option');
	QUnit.equal(barOptionTeardown(), 1, 'got ../bar/name option');

	Scope.prototype.getPathsForKey = origGetPaths;

});
