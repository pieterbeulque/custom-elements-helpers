import { parse as parseEvent, getPath } from '../util/events';
import promisify from '../util/promise';
import waitForDOMReady from '../util/dom-ready';
import elementIsInDOM from '../util/element-is-in-dom';

const BASE_CONTROLLER_HANDLERS = Symbol('BASE_CONTROLLER_HANDLERS');

export default class BaseController {
	constructor(el) {
		const noop = () => {};

		this.el = el;

		this.resolve().then(() => {
			if (!elementIsInDOM(this.el)) {
				return Promise.reject('The element has disappeared');
			}

			this.el.classList.add('is-resolved');

			const init = () => promisify(() => {
				if (!elementIsInDOM(this.el)) {
					return Promise.reject('The element has disappeared');
				}

				return this.init();
			});

			const render = () => promisify(() => {
				if (!elementIsInDOM(this.el)) {
					return Promise.reject('The element has disappeared');
				}

				return this.render();
			});

			const bind = () => promisify(() => {
				if (!elementIsInDOM(this.el)) {
					return Promise.reject('The element has disappeared');
				}

				return this.bind();
			});

			return init().then(() => render().then(() => bind().then(() => this))).catch(noop);
		}).catch(noop);
	}

	destroy() {
		this.el.classList.remove('is-resolved');
	}

	resolve() {
		return waitForDOMReady();
	}

	init() { }

	render() { }

	bind() { }

	unbind() {
		if (this[BASE_CONTROLLER_HANDLERS]) {
			this[BASE_CONTROLLER_HANDLERS].forEach((listener) => {
				listener.target.removeEventListener(listener.event, listener.handler, listener.options);
			});

			this[BASE_CONTROLLER_HANDLERS] = [];
		}
	}

	on(name, handler, target = null, options = false) {
		this[BASE_CONTROLLER_HANDLERS] = this[BASE_CONTROLLER_HANDLERS] || [];

		const { event, selector } = parseEvent(name);
		const parsedTarget = !target ? this.el : target;

		let wrappedHandler = function (e) {
			handler(e, e.target);
		};

		if (selector) {
			wrappedHandler = function (e) {
				const path = getPath(e);

				const matchingTarget = path.find((tag) => tag.matches && tag.matches(selector));

				if (matchingTarget) {
					handler(e, matchingTarget);
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

		this[BASE_CONTROLLER_HANDLERS].push(listener);

		return this;
	}

	once(name, handler, target = null, options = false) {
		const wrappedHandler = (e, matchingTarget) => {
			this.off(name, target);
			handler(e, matchingTarget);
		};

		this.on(name, wrappedHandler, target, options);
	}

	off(name, target = null) {
		const { event, selector } = parseEvent(name);
		const parsedTarget = !target ? this.el : target;

		const listener = this[BASE_CONTROLLER_HANDLERS].find((handler) => {
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
			this[BASE_CONTROLLER_HANDLERS].splice(this[BASE_CONTROLLER_HANDLERS].indexOf(listener), 1);

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
