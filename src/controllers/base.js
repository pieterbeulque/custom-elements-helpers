import { parse as parseEvent, getPath } from '../util/events';

export default class BaseController {

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

		const { event, selector } = parseEvent(name);
		const parsedTarget = !target ? this.el : target;

		let wrappedHandler = function (e) {
			handler(e, e.currentTarget);
		};

		if (selector) {
			wrappedHandler = function (e) {
				const path = getPath(e);

				const currentTarget = path.find((tag) => tag.matches(selector));

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

}
