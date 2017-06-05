import BaseController from '../controllers/base';
import fetchJSONP from '../util/fetch';

const convertFormDataToQuerystring = function (values) {
	return Array.from(values, ([key, raw]) => {
		if (raw) {
			const value = window.encodeURIComponent(raw);
			return `${key}=${value}`;
		}

		return '';
	}).join('&');
};

export default {
	attributes: [
		{ attribute: 'jsonp', type: 'bool' },
	],
	controller: class extends BaseController {

		get action() {
			return this.elements.form.action;
		}

		get method() {
			if (this.jsonp) {
				return 'GET';
			}

			return (this.elements.form.method || 'POST').toUpperCase();
		}

		get values() {
			return new FormData(this.elements.form);
		}

		init() {
			this.elements = this.elements || {};
			this.elements.form = this.el.getElementsByTagName('form')[0];
			this.elements.successMessage = this.el.getElementsByClassName('js-ajax-form-success')[0];
			this.elements.errorMessage = this.el.getElementsByClassName('js-ajax-form-error')[0];

			if (!this.elements.form) {
				console.warn('Activated MrAjaxForm without a form');
			} else {
				this.elements.fields = this.elements.form.getElementsByTagName('input');
			}
		}

		render() {
			// We can disable the HTML5 front-end validation
			// and handle it more gracefully in JS
			// @todo
			this.elements.form.setAttribute('novalidate', 'novalidate');
		}

		bind() {
			const reset = () => {
				if (this.elements.successMessage) {
					this.elements.successMessage.setAttribute('hidden', 'hidden');
				}

				if (this.elements.errorMessage) {
					this.elements.errorMessage.setAttribute('hidden', 'hidden');
				}
			};

			this.on('submit', (e) => {
				e.preventDefault();

				reset();

				const { url, params } = this.prepare(this.method);

				this.submit(url, params)
					.then((data) => {
						this.onSuccess(data);
					}, (err) => {
						this.onError(err);
					});
			}, this.elements.form);
		}

		prepare(method) {
			const get = () => {
				const querystring = convertFormDataToQuerystring(this.values);
				const url = `${this.action}?${querystring}`;
				const params = {
					method: 'GET',
					headers: new Headers({
						'Content-Type': 'application/json',
					}),
				};

				return { url, params };
			};

			const post = () => {
				const url = this.action;
				const params = {
					method: 'POST',
					headers: new Headers({
						'Content-Type': 'application/x-www-form-urlencoded',
					}),
				};

				return { url, params };
			};

			if (method.toUpperCase() === 'GET') {
				return get();
			}

			if (method.toUpperCase() === 'POST') {
				return post();
			}

			return { url: '/', params: { method: 'GET' } };
		}

		submit(url, params = {}) {
			if (this.jsonp) {
				return fetchJSONP(url);
			}

			return fetch(url, params).then((res) => {
				if (res.status && res.status === 200) {
					return res;
				}

				const error = new Error(res.statusText);
				throw error;
			}).then((res) => {
				const type = res.headers.get('Content-Type');

				if (type && type.includes('application/json')) {
					return res.json();
				}

				return res.text();
			});
		}

		// eslint-disable-next-line no-unused-vars
		onSuccess(res) {
			if (this.elements.successMessage) {
				this.elements.successMessage.removeAttribute('hidden');
			}

			this.elements.form.parentNode.removeChild(this.elements.form);
		}

		// eslint-disable-next-line no-unused-vars
		onError(err) {
			if (this.elements.errorMessage) {
				this.elements.errorMessage.removeAttribute('hidden');
			}
		}

	},
};
