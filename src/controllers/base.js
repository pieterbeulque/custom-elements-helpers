import { parse as parseEvent, getPath } from '../util/events';
import promisify from '../util/promise';
import waitForDOMReady from '../util/dom-ready';

export default class BaseController {

	constructor(el) {
		this.el = el;

		this.resolve().then(() => {
			this.el.classList.add('is-resolved');

			const init = () => promisify(() => this.init());
			const render = () => promisify(() => this.render());
			const bind = () => promisify(() => this.bind());

			return init().then(() => render().then(() => bind().then(() => this)));
		});
	}

	destroy() {
		this.el.classList.remove('is-resolved');
		return this.unbind();
	}

	resolve() {
		return waitForDOMReady();
	}

	init() { }

	render() { }

	bind() { }

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

		this._handlers.push(listener);

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
