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

		let wrappedHandler = function (e) {
			handler(e, e.currentTarget);
		};

		if (event.indexOf(' ') > 0) {
			selector = event.split(' ').splice(1).join(' ').trim();

			if (selector.length > 0) {
				event = event.split(' ').shift();

				wrappedHandler = function (e) {
					let matches = false;

					if (!e.path) {
						e.path = [e.target];
						let node = e.target;

						while (node.parentNode) {
							node = node.parentNode;
							e.path.push(node);
						}
					}

					for (let i = 0; i < e.path.length; i++) {
						const tag = e.path[i];

						if (tag.matches(selector)) {
							matches = tag;
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
						handler(e, matches);
					}
				}
			}
		}

		const listener = { target, selector, event, handler: wrappedHandler, options };

		listener.target.addEventListener(listener.event, listener.handler, listener.options);

		this._handlers.push(listener);

		return this;
	}

	once(event, handler, target = null, options = false) {
		const wrappedHandler = (e, currentTarget) => {
			this.off(event, target);
			handler(e, currentTarget);
		};

		this.on(event, wrappedHandler, target, options);
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

		if (!!listener && !!listener.target) {
			this._handlers.splice(this._handlers.indexOf(listener), 1);

			listener.target.removeEventListener(listener.event, listener.handler, listener.options);
		}
	}

}
