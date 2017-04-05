'use strict';

function parse(name) {
	const clean = name.trim();
	const parts = clean.split(' ');

	let event = clean;
	let selector = null;

	if (parts.length > 1) {
		event = parts.shift();
		selector = parts.join(' ');
	}

	return { event, selector };
}

function getPath(e) {
	let path = e.path;

	if (!path) {
		path = [e.target];
		let node = e.target;

		while (node.parentNode) {
			node = node.parentNode;
			path.push(node);
		}
	}

	return path;
}

class BaseController {

	constructor(el) {
		this.el = el;

		this.resolve().then(() => {
			this.el.classList.add('is-resolved');
			return this.init().render().bind();
		});
	}

	destroy() {
		this.el.classList.remove('is-resolved');
		return this.unbind();
	}

	resolve() {
		return new Promise((resolve) => {
			if (document.readyState === 'complete') {
				resolve();
			} else {
				const handler = function () {
					if (document.readyState === 'complete') {
						document.removeEventListener('readystatechange', handler, false);
						resolve();
					}
				};

				document.addEventListener('readystatechange', handler, false);
			}
		});
	}

	init() { return this; }

	bind() { return this; }

	render() { return this; }

	unbind() {
		if (this._handlers) {
			this._handlers.forEach((listener) => {
				listener.target.removeEventListener(listener.event, listener.handler, listener.options);
			});
		}

		return this;
	}

	on(name, handler, target = null, options = false) {
		this._handlers = this._handlers || [];

		const { event, selector } = parse(name);
		const parsedTarget = !target ? this.el : target;

		let wrappedHandler = function (e) {
			handler(e, e.currentTarget);
		};

		if (selector) {
			wrappedHandler = function (e) {
				const path = getPath(e);

				const currentTarget = path.find((tag) => tag.matches && tag.matches(selector));

				if (currentTarget) {
					handler(e, currentTarget);
				}
			};
		}

		const listener = {
			target: parsedTarget,
			selector,
			event,
			handler: wrappedHandler,
			options,
		};

		listener.target.addEventListener(listener.event, listener.handler, listener.options);

		this._handlers.push(listener);

		return this;
	}

	once(name, handler, target = null, options = false) {
		const wrappedHandler = (e, currentTarget) => {
			this.off(name, target);
			handler(e, currentTarget);
		};

		this.on(name, wrappedHandler, target, options);
	}

	off(name, target = null) {
		const { event, selector } = parse(name);
		const parsedTarget = !target ? this.el : target;

		const listener = this._handlers.find((handler) => {
			// Selectors don't match
			if (handler.selector !== selector) {
				return false;
			}

			// Event type don't match
			if (handler.event !== event) {
				return false;
			}

			// Passed a target, but the targets don't match
			if (!!parsedTarget && handler.target !== parsedTarget) {
				return false;
			}

			// Else, we found a match
			return true;
		});

		if (!!listener && !!listener.target) {
			this._handlers.splice(this._handlers.indexOf(listener), 1);

			listener.target.removeEventListener(listener.event, listener.handler, listener.options);
		}
	}

	emit(name, data = {}, options = {}) {
		const params = Object.assign({
			detail: data,
			bubbles: true,
			cancelable: true,
		}, options);

		const event = new CustomEvent(name, params);

		this.el.dispatchEvent(event);
	}

}

const addMethod = function (customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	customElement.prototype[name] = method;
};

const addGetter = function (customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	Object.defineProperty(customElement.prototype, name, {
		configurable: false,
		get: method,
	});
};

const addProperty = function (customElement, name, getter = null, setter = null) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	const noop = function () {};

	Object.defineProperty(customElement.prototype, name, {
		configurable: false,
		get: typeof getter === 'function' ? getter : noop,
		set: typeof setter === 'function' ? setter : noop,
	});
};

class AttrMedia {

	static attachTo(customElement) {
		// Adds customElement.media
		// @return string 		Value of `media=""` attribute
		addGetter(customElement, 'media', function getMediaAttribute() {
			return this.el.hasAttribute('media') ? this.el.getAttribute('media') : false;
		});

		// Adds customElement.matchesMedia
		// @return bool 		If the viewport currently matches the specified media query
		addGetter(customElement, 'matchesMedia', function matchesMedia() {
			if (!this.media) {
				return true;
			}

			return 'matchMedia' in window && !!window.matchMedia(this.media).matches;
		});

		// Adds customElements.whenMediaMatches()
		// @return Promise
		addMethod(customElement, 'whenMediaMatches', function whenMediaMatches() {
			const defer = new Promise((resolve) => {
				let mq;

				const handler = function () {
					if (mq.matches) {
						resolve();
						mq.removeListener(handler);
					}
				};

				if ('matchMedia' in window) {
					mq = window.matchMedia(this.media);
					mq.addListener(handler);
					handler(mq);
				} else {
					resolve();
				}
			});

			return defer;
		});
	}

}

const parseMetaTag = (function parseMetaTag() {
	const blacklist = ['viewport'];

	return function parse(tag) {
		const name = tag.getAttribute('name');
		const property = tag.getAttribute('property');
		const content = tag.getAttribute('content');

		if (!name && !property) {
			return false;
		}

		if (blacklist.includes(name)) {
			return false;
		}

		return { name, property, content };
	};
}());

const parseHTML = (function parseHTML() {
	const parser = new DOMParser();

	return function parse(html, selector = null) {
		const parsed = parser.parseFromString(html, 'text/html');

		// Get document title
		const title = parsed.title;

		// Get document nodes
		let content = parsed.body;

		if (selector) {
			content = parsed.body.querySelector(selector);

			if (!content) {
				throw new Error('not-found');
			}
		}

		// Get document meta
		const meta = Array.from(parsed.head.querySelectorAll('meta'), (tag) => parseMetaTag(tag)).filter((t) => !!t);

		return { title, content, meta };
	};
}());

const noop = function () {};

const generateStringAttributeMethods = function (attribute) {
	const getter = function () {
		return this.el.getAttribute(attribute) || undefined;
	};

	const setter = function (to) {
		if (to) {
			this.el.setAttribute(attribute, to);
		} else {
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

const generateBoolAttributeMethods = function (attribute) {
	const getter = function () {
		return !!this.el.hasAttribute(attribute);
	};

	const setter = function (to) {
		if (to) {
			this.el.setAttribute(attribute, attribute);
		} else {
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

const generateIntegerAttributeMethods = function (attribute) {
	const getter = function () {
		return parseInt(this.el.getAttribute(attribute), 10);
	};

	const setter = function (to) {
		const parsed = parseInt(to, 10);

		if (!Number.isNaN(parsed)) {
			this.el.setAttribute(attribute, parsed);
		} else {
			console.warn(`Could not set ${attribute} to ${to}`);
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

const generateNumberAttributeMethods = function (attribute) {
	const getter = function () {
		return parseFloat(this.el.getAttribute(attribute));
	};

	const setter = function (to) {
		const parsed = parseFloat(to);

		if (!Number.isNaN(parsed)) {
			this.el.setAttribute(attribute, parsed);
		} else {
			console.warn(`Could not set ${attribute} to ${to}`);
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

const generateAttributeMethods = function (attribute, type = 'string') {
	if (type === 'bool') {
		return generateBoolAttributeMethods(attribute);
	} else if (type === 'int' || type === 'integer') {
		return generateIntegerAttributeMethods(attribute);
	} else if (type === 'float' || type === 'number') {
		return generateNumberAttributeMethods(attribute);
	} else if (type === 'string') {
		return generateStringAttributeMethods(attribute);
	}
	return { getter: noop, setter: noop };
};

function defineCustomElement(tag, options = {}) {
	// Attach all passed attributes to the passed controller
	if (options.attributes && options.attributes.length) {
		options.attributes.forEach((attribute) => {
			// String, sync with actual element attribute
			if (typeof attribute === 'string') {
				const { getter, setter } = generateAttributeMethods(attribute, 'string');
				addProperty(options.controller, attribute, getter, setter);
			} else if (typeof attribute.attachTo === 'function') {
				attribute.attachTo(options.controller);
			} else if (typeof attribute === 'object') {
				const type = attribute.type || 'string';
				const name = attribute.attribute;

				const { getter, setter } = generateAttributeMethods(name, type);

				addProperty(options.controller, name, getter, setter);
			}
		});
	}

	return customElements.define(tag, class extends HTMLElement {

		connectedCallback() {
			this.controller = new options.controller(this);
		}

		disconnectedCallback() {
			this.controller.destroy();
		}

	});
}

// Base Controller

const assert = window.chai.assert;
const mocha = window.mocha;

mocha.setup('tdd');

let instance;

const controller = class extends BaseController {

	init() {
		instance = this;
		return this;
	}

	bind() {
		console.log('bind');

		this.whenMediaMatches().then(() => {
			console.log(1);
		});

		this.whenMediaUnmatches().then(() => {
			console.log(2);
		});

		this.watchMedia(
			() => {
				this.el.style.color = 'green';
				console.log('Media matched');
			},
			() => {
				console.log('Media unmatched');
				this.el.style.color = 'red';
			}
		);

		return this;
	}

	render() {
		mocha.run();
		return this;
	}

	whenMediaUnmatches() {
		const defer = new Promise((resolve) => {
			let mq;

			const handler = function () {
				if (!mq.matches) {
					resolve();
					mq.removeListener(handler);
				}
			};

			if ('matchMedia' in window) {
				mq = window.matchMedia(this.media);
				mq.addListener(handler);
				handler(mq);
			} else {
				resolve();
			}
		});

		return defer;
	}

	watchMedia(match = function () {}, unmatch = function () {}) {
		let mq;

		const handler = function () {
			if (mq.matches) {
				match();
			} else {
				unmatch();
			}
		};

		if ('matchMedia' in window) {
			mq = window.matchMedia(this.media);
			mq.addListener(handler);
			handler(mq);
		}
	}

};

defineCustomElement('test-attr-media', {
	attributes: [ AttrMedia ],
	controller: controller
});

const node = document.createElement('test-attr-media');
node.setAttribute('media', '(min-width: 768px)');
node.innerHTML = 'This is a block element that has the media attribute.';

document.getElementsByClassName('js-demo')[0].appendChild(node);

customElements.whenDefined('test-attr-media');

suite('Attributes', function () {
	test('this.media returns a string value', function () {
		assert.equal(typeof instance.media, 'string');
	});

	test('this.media equals the media attribute value', function () {
		assert.equal(node.getAttribute('media'), instance.media);
	});

	test('this.matchesMedia returns a boolean value', function () {
		assert.equal(typeof instance.matchesMedia, 'boolean');
	});
});

suite('Methods', function () {
	test('this.whenMediaMatches() returns a Promise', function () {
		assert.equal(typeof instance.whenMediaMatches().then, 'function');
	});
});
