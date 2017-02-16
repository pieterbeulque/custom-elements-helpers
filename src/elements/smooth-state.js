import BaseController from '../controllers/base';

export default {
	attributes: [],
	controller: class extends BaseController {

		get path() {
			return this._path || [];
		}

		get latestPathEntry() {
			const length = this.path.length;

			if (length > 0) {
				return this.path[length - 1];
			}

			return undefined;
		}

		set path(to) {
			console.warn(`You can't directly set the path`);
		}

		addToPath(href) {
			// Make sure `href` is an absolute path from the / root of the current site
			href = href.replace(window.location.origin, '');
			href = href[0] !== '/' ? `/${href}` : href;

			this._path = this._path || [];

			let from;

			if (this._path.length > 0) {
				from = this._path[this._path.length - 1].to;
			}

			const pathEntry = {
				from: from,
				to: href
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
			const href = window.location.href;
			const title = document.title;

			this.replaceState(href, title);

			return this;
		}

		bind() {
			this.on('popstate', e => {
				if (e.state && e.state.href) {
					this.goTo(e.state.href, false).catch(err => {
						console.warn('Could not run popstate to', e.state.href);
						console.warn('Error:', err);
					});
				}
			}, window);

			this.on('click a', e => {
				let node = e.target;
				const path = Object.assign([], e.path);

				while (path.length > 0 && node && node.tagName && node.tagName.toLowerCase() !== 'a') {
					node = path.shift();

					// Not an `<a>` in the path if we arrived at the smoothState element
					if (node === this.el) {
						return;
					}
				}

				if (node.classList && node.classList.contains('js-mr-smooth-state-disable')) {
					return;
				}

				e.preventDefault();
				e.stopPropagation();

				const href = node.getAttribute('href');
				this.goTo(href).catch(err => {
					console.warn('Could not navigate to', href);
					console.warn('Error:', err);
				});
			}, document.body);
		}

		goTo(href, pushState = true) {
			const parseHTML = html => {
				const doc = document.implementation.createHTMLDocument();
				doc.documentElement.innerHTML = html;

				const title = doc.title;
				const container = doc.body.getElementsByTagName('mr-smooth-state');

				const content = (container.length === 0) ? doc.body : container[0];

				return { title, content };
			};

			const renderNodes = (content, container) => {
				container.innerHTML = '';

				for (let i = content.children.length - 1; i >= 0; i--) {
					const child = content.children[i];

					if (container.firstChild) {
						container.insertBefore(child, container.firstChild);
					} else {
						container.appendChild(child);
					}
				}
			};

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
					fetch(href).then(res => res.text()).then(html => {
						const { title, content } = parseHTML(html);

						window.dispatchEvent(new CustomEvent('smoothState:start'));

						transition.fetched = { title, content };

						this.onStart(transition).then(() => {
							window.dispatchEvent(new CustomEvent('smoothState:ready'));

							this.onReady(transition).then(() => {
								const { title, content } = transition.fetched;

								window.requestAnimationFrame(() => {
									renderNodes(content, this.el);
									document.title = title;

									if (!!pushState) {
										// Don't add the state to the path
										this.pushState(href, title, false);
									}

									window.requestAnimationFrame(() => {
										document.body.classList.remove('is-loading');

										window.dispatchEvent(new CustomEvent('smoothState:after'));

										// You can't cancel the transition after the pushState
										// So we also resolve inside the catch
										this.onAfter(transition).then(() => resolve()).catch((err) => resolve());
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

	}
};
