import BaseController from '../controllers/base';
import fetchJSONP from '../util/fetch';

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

		get valuesAsQuerystring() {
			return Array.from(this.values, ([key, raw]) => {
				if (raw) {
					const value = window.encodeURIComponent(raw);
					return `${key}=${value}`;
				}

				return '';
			}).join('&');
		}

		init() {
			this.errorMessages = [];

			this.elements = this.elements || {};
			this.elements.form = this.el.getElementsByTagName('form')[0];
			this.elements.successMessage = this.el.getElementsByClassName('js-ajax-form-success')[0];
			this.elements.errorMessage = this.el.getElementsByClassName('js-ajax-form-error')[0];

			if (!this.elements.form) {
				console.warn('Activated MrAjaxForm without a form');
				return this;
			}

			this.elements.fields = this.elements.form.getElementsByTagName('input');

			return this;
		}

		render() {
			// We can disable the HTML5 front-end validation
			// and handle it more gracefully in JS
			this.elements.form.setAttribute('novalidate', 'novalidate');

			return this;
		}

		bind() {
			const reset = () => {
				this.elements.successMessage.setAttribute('hidden', 'hidden');
				this.elements.errorMessage.setAttribute('hidden', 'hidden');
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

			return this;
		}

		prepare(method) {
			const get = () => {
				const querystring = this.valuesAsQuerystring;
				const url = `${this.action}?${querystring}`;
				const params = {};
				params.method = this.method;
				params.headers = new Headers({
					'Content-Type': 'application/json',
				});

				return { url, params };
			};

			const post = () => {
				const url = this.action;
				const params = {};
				params.method = this.method;
				params.headers = new Headers({
					'Content-Type': 'application/x-www-form-urlencoded',
				});

				return { url, params };
			};

			if (method === 'GET') {
				return get();
			} else if (method === 'POST') {
				return post();
			}

			return { url: '/', params: { method: 'GET' } };
		}

		submit(url, params = {}) {
			if (this.jsonp) {
				return fetchJSONP(url);
			}

			return fetch(url, params).then((res) => {
				if (res.status && res.status.ok) {
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
			this.elements.successMessage.removeAttribute('hidden');
			this.elements.form.parentNode.removeChild(this.elements.form);
		}

		// eslint-disable-next-line no-unused-vars
		onError(err) {
			this.elements.errorMessage.removeAttribute('hidden');
		}

		validate() {
			this.errorMessages.forEach((error) => {
				error.parentNode.removeChild(error);
			});

			this.errorMessages = Array.from(this.elements.fields, (field) => {
				if (!field.checkValidity()) {
					const error = document.createElement('p');
					error.textContent = field.validationMessage;
					field.parentNode.appendChild(error);
					return error;
				}

				return undefined;
			}).filter((field) => !!field);
		}

	},
};
