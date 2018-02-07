import BaseController from '../controllers/base';
import { parseHTML, renderNodes } from '../util/html';

const smoothState = {
	attributes: [],
	controller: class extends BaseController {
		get path() {
			return this._path || [];
		}

		get latestPathEntry() {
			if (this.path.length > 0) {
				return this.path[this.path.length - 1];
			}

			return undefined;
		}

		addToPath(href) {
			// Make sure `href` is an absolute path from the / root of the current site
			let absolutePath = href.replace(window.location.origin, '');
			absolutePath = absolutePath[0] !== '/' ? `/${absolutePath}` : absolutePath;

			this._path = this._path || [];

			let from;

			if (this._path.length > 0) {
				from = this._path[this._path.length - 1].to;
			}

			const pathEntry = {
				from,
				to: absolutePath,
			};

			this._path.push(pathEntry);

			return this;
		}

		removeLatestFromPath() {
			(this._path || []).pop();
			return this;
		}

		pushState(href, title = '', addToPath = true) {
			const state = { href, title };

			window.history.pushState(state, title, href);

			if (addToPath) {
				this.addToPath(href);
			}

			return this;
		}

		replaceState(href, title = '', addToPath = true) {
			const state = { href, title };

			window.history.replaceState(state, title, href);

			if (addToPath) {
				this.addToPath(href);
			}

			return this;
		}

		init() {
			this.replaceState(window.location.href, document.title);

			return this;
		}

		bind() {
			this.on('popstate', (e) => {
				if (e.state && e.state.href) {
					this.goTo(e.state.href, false).catch((err) => {
						console.warn('Could not run popstate to', e.state.href);
						console.warn('Error:', err);
					});
				}
			}, window);

			this.on('click a', (e, target) => {
				if (target.classList && target.classList.contains('js-mr-smooth-state-disable')) {
					return;
				}

				// Avoid cross-origin calls
				if (!target.hostname || target.hostname !== window.location.hostname) {
					return;
				}

				const href = target.getAttribute('href');

				if (!href) {
					console.warn('Click on link without href');
					return;
				}

				e.preventDefault();
				e.stopPropagation();

				this.goTo(href).catch((err) => {
					console.warn('Could not navigate to', href);
					console.warn('Error:', err);
				});
			}, document.body);
		}

		goTo(href, pushState = true) {
			return new Promise((resolve, reject) => {
				window.dispatchEvent(new CustomEvent('smoothState:before'));

				document.body.classList.add('is-loading');

				this.addToPath(href);

				const cancel = (err) => {
					this.removeLatestFromPath();
					reject(err);
				};

				const transition = {};
				transition.container = this.el;
				transition.path = Object.assign(this.latestPathEntry);

				return this.onBefore(transition).then(() => {
					fetch(href, { credentials: 'include' }).then((res) => res.text()).then((html) => {
						const { title, content } = parseHTML(html, 'mr-smooth-state');

						window.dispatchEvent(new CustomEvent('smoothState:start'));

						transition.fetched = { title, content };

						this.onStart(transition).then(() => {
							window.dispatchEvent(new CustomEvent('smoothState:ready'));

							this.onReady(transition).then(() => {
								const { title: verifiedTitle, content: verifiedContent } = transition.fetched;

								window.requestAnimationFrame(() => {
									renderNodes(verifiedContent, this.el);
									document.title = verifiedTitle;

									if (pushState) {
										// Don't add the state to the path
										this.pushState(href, verifiedTitle, false);
									}

									window.requestAnimationFrame(() => {
										document.body.classList.remove('is-loading');

										window.dispatchEvent(new CustomEvent('smoothState:after'));

										// You can't cancel the transition after the pushState
										// So we also resolve inside the catch
										this.onAfter(transition).then(() => resolve()).catch(() => resolve());
									});
								});
							}).catch((err) => cancel(err));
						}).catch((err) => cancel(err));
					}).catch((err) => cancel(err));
				}).catch((err) => cancel(err));
			});
		}

		onBefore(transition) {
			return Promise.resolve(transition);
		}

		onStart(transition) {
			return Promise.resolve(transition);
		}

		onReady(transition) {
			return Promise.resolve(transition);
		}

		onAfter(transition) {
			return Promise.resolve(transition);
		}
	},
};

export default smoothState;
