import { defineCustomElement, BaseController } from 'index';

const { defineTests, runTests } = (function () {
	const tests = {};

	const sanitizeKey = function (key, prefix = 'test') {
		if (!prefix) {
			prefix = 'test';
		}

		const sanitized = key.toLowerCase()
		                     .replace(/[^a-z]/gi, '-')
		                     .replace(/\-+/gi, '-')
		                     .replace(/\-$/, '')
		                     .replace(/^-/, '');

		return `${prefix}-${sanitized}`;
	};

	return {
		defineTests(key, spec) {
			if (tests[key]) {
				console.warn(`Test suite ${key} already exists. Will override`);
			}

			if (typeof spec === 'function') {
				tests[key] = function () {
					spec();
				};
			} else if (typeof spec === 'object') {
				tests[key] = function () {
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

const generateDemoNode = function (tag, definition = {}, options = {}) {
	const node = document.createElement(tag);
	const demo = { node };

	let customElement;
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
			customElement = null;
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

export { generateDemoNode, defineTests, runTests };
