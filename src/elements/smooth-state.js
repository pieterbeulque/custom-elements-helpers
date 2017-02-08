import BaseController from '../controllers/base';

export default {
	attributes: [],
	controller: class extends BaseController {

		init() {
			const href = window.location.href;
			const title = document.title;

			window.history.pushState({ href, title }, title, href);

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

				return this.onBefore(href).then(() => {
					fetch(href).then(res => res.text()).then(html => {
						const { title, content } = parseHTML(html);

						window.dispatchEvent(new CustomEvent('smoothState:start'));

						this.onStart().then(() => {
							window.dispatchEvent(new CustomEvent('smoothState:ready'));

							this.onReady(content).then((content) => {
								window.requestAnimationFrame(() => {
									renderNodes(content, this.el);
									document.title = title;

									if (!!pushState) {
										window.history.pushState({ href, title }, title, href);
									}

									window.requestAnimationFrame(() => {
										document.body.classList.remove('is-loading');

										window.dispatchEvent(new CustomEvent('smoothState:after'));

										this.onAfter().then(() => resolve()).catch((err) => reject(err));
									});
								});
							}).catch((err) => reject(err));
						}).catch((err) => reject(err));
					}).catch((err) => reject(err));
				}).catch((err) => reject(err));
			});
		}

		onBefore(to) {
			return Promise.resolve();
		}

		onStart() {
			return Promise.resolve();
		}

		onReady(content) {
			return Promise.resolve(content);
		}

		onAfter() {
			return Promise.resolve();
		}

	}
};
