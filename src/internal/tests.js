/* global mocha */

import defineCustomElement from '../util/define';

const generateDemoNode = function (tag, definition = {}) {
	const node = document.createElement(tag);
	const demo = { node };

	let copy;

	const controller = class extends definition.controller {

		constructor(el) {
			super(el);
			demo.customElement = this;

			if (definition.controller) {
				copy = new (class extends definition.controller {
					resolve() { return Promise.reject(); }
				})(el);
			}
		}

		destroy() {
			demo.customElement = null;
			copy = null;
			copy.destroy.apply(this);
			super.destroy();
		}

		init() {
			copy.init.apply(this);
			return this;
		}

		bind() {
			copy.bind.apply(this);
			return this;
		}

		render() {
			copy.render.apply(this);
			mocha.run();
			return this;
		}

		resolve() {
			return Promise.all([
				super.resolve(),
			]);
		}

	};

	defineCustomElement(tag, {
		attributes: definition.attributes || [],
		controller,
	});

	return demo;
};

const { defineTests, runTests } = (function testHelpersGenerator() {
	const tests = {};

	const sanitizeKey = function (key, prefix = 'test') {
		const validPrefix = typeof prefix === 'string' ? prefix : 'test';

		const sanitized = key
			.toLowerCase()
			.replace(/[^a-z]/gi, '-')
			.replace(/-+/gi, '-')
			.replace(/-$/, '')
			.replace(/^-/, '');

		return `${validPrefix}-${sanitized}`;
	};

	return {
		defineTests(key, spec) {
			if (tests[key]) {
				console.warn(`Test suite ${key} already exists. Will override`);
			}

			if (typeof spec === 'function') {
				tests[key] = function runSpec() {
					spec();
				};
			} else if (typeof spec === 'object') {
				tests[key] = function runSpec() {
					let env = { node: document.createElement('div') };

					if (typeof spec.demo === 'object') {
						env = generateDemoNode(sanitizeKey(key), spec.demo);
					}

					if (typeof spec.before === 'function') {
						spec.before(env);
					}

					if (typeof spec.run === 'function') {
						spec.run(env);
					}

					if (typeof spec.after === 'function') {
						spec.after();
					}
				};
			}
		},
		runTests(key) {
			if (!tests[key]) {
				console.warn(`Test suite ${key} does not exists`);
			}

			tests[key]();
		},
	};
}());

export { generateDemoNode, defineTests, runTests };
