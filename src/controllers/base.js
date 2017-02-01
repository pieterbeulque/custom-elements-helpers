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
		return new Promise(function (resolve, reject) {
			if (document.readyState === 'complete') {
				return resolve();
			}

			const handler = function () {
				if (document.readyState === 'complete') {
					document.removeEventListener('readystatechange', handler, false);
					return resolve();
				}
			};

			document.addEventListener('readystatechange', handler, false);
		});
	}

	init() { return this; }

	bind() { return this; }

	render() { return this; }

	unbind() {
		if (this._handlers) {
			for (let listener of this._handlers) {
				listener.target.removeEventListener(listener.event, listener.handler, listener.options);
			}
		}

		return this;
	}

	on(event, handler, target = null, options = false) {
		event = event.trim();

		this._handlers = this._handlers || [];

		if (!target) {
			target = this.el;
		}

		let selector;
		let wrappedHandler;

		if (event.indexOf(' ') > 0) {
			selector = event.split(' ').splice(1).join(' ').trim();

			if (selector.length > 1) {
				event = event.split(' ').shift();

				wrappedHandler = function (e) {
					let matches = false;

					for (let i = 0; i < e.path.length; i++) {
						const tag = e.path[i];

						if (tag.matches(selector)) {
							matches = true;
							break;
						}

						if (tag === document.body) {
							break;
						}

						if (tag === target) {
							break;
						}
					}

					if (matches) {
						handler(e);
					}
				}
			}
		}

		if (!wrappedHandler) {
			wrappedHandler = handler;
		}

		const listener = { target, selector, event, handler: wrappedHandler, options };

		listener.target.addEventListener(listener.event, listener.handler, listener.options);

		this._handlers.push(listener);

		return this;
	}

	off(event, target = null) {
		let selector;

		if (event.indexOf(' ') > 0) {
			selector = event.split(' ').splice(1).join(' ').trim();

			if (selector.length > 1) {
				event = event.split(' ').shift();
			}
		}

		const listener = this._handlers.find(h => {
			return h.selector === selector && h.event === event && (!target || h.target === target);
		});

		listener.target.removeEventListener(listener.event, listener.handler, listener.options);
	}

}
