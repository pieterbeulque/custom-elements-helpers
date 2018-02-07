import BaseController from '../controllers/base';

const getMetaValues = function (node = document.head, selector = '') {
	const extractKey = function (tag) {
		let raw = tag.getAttribute('name');

		if (!raw) {
			raw = tag.getAttribute('property');
		}

		const stripped = raw.match(/^(?:.*:)?(.*)$/i);

		if (stripped) {
			return stripped[1];
		}

		return null;
	};

	const tags = [...node.querySelectorAll(`meta${selector}`)];

	// Get <meta> values
	return tags.reduce((carry, tag) => {
		const key = extractKey(tag);

		if (key) {
			const value = tag.getAttribute('content');
			Object.assign(carry, { [key]: value });
		}

		return carry;
	}, {});
};

const generateQuerystring = function (params) {
	const querystring = Object.entries(params).map(([key, value]) => {
		if (value) {
			const encoded = window.encodeURIComponent(value);
			return `${key}=${encoded}`;
		}

		return '';
	}).filter((param) => !!param).join('&');

	if (querystring.length > 0) {
		return `?${querystring}`;
	}

	return '';
};

const openWindow = function (href, params = {}, options = {}) {
	const querystring = generateQuerystring(params);
	const { name, invisible } = options;

	if (invisible) {
		window.location = `${href}${querystring}`;
		return;
	}

	let { width, height } = options;

	width = width || 560;
	height = height || 420;

	const x = Math.round((window.innerWidth - width) / 2);
	const y = Math.round((window.innerHeight - height) / 2);

	const popup = window.open(`${href}${querystring}`, name, `width=${width}, height=${height}, left=${x}, top=${y}`);

	if (typeof popup.focus === 'function') {
		popup.focus();
	}
};

const share = {
	attributes: [],
	controller: class extends BaseController {
		get title() {
			const attribute = this.el.getAttribute('mr-share-title');
			const fallback = document.title;
			return attribute || fallback;
		}

		get description() {
			const attribute = this.el.getAttribute('mr-share-description');
			let fallback = '';

			const tag = document.head.querySelector('meta[name="description"');

			if (tag) {
				fallback = tag.getAttribute('content');
			}

			return attribute || fallback;
		}

		get url() {
			const attribute = this.el.getAttribute('mr-share-url');
			let fallback = window.location.href;

			const tag = document.head.querySelector('link[rel="canonical"]');

			if (tag) {
				fallback = tag.getAttribute('href');
			}

			return attribute || fallback;
		}

		init() {
			this.elements = {};

			this.elements.facebook = this.el.getElementsByClassName('js-share-facebook').item(0);
			this.elements.twitter = this.el.getElementsByClassName('js-share-twitter').item(0);
			this.elements.pinterest = this.el.getElementsByClassName('js-share-pinterest').item(0);
			this.elements.mail = this.el.getElementsByClassName('js-share-mail').item(0);

			return this;
		}

		bind() {
			if (this.elements.facebook) {
				this.on('click', (e) => {
					e.stopPropagation();
					this.shareOnFacebook();
				}, this.elements.facebook);
			}

			if (this.elements.twitter) {
				this.on('click', (e) => {
					e.stopPropagation();
					this.shareOnTwitter();
				}, this.elements.twitter);
			}

			if (this.elements.pinterest) {
				this.on('click', (e) => {
					e.stopPropagation();
					this.shareOnPinterest();
				}, this.elements.pinterest);
			}

			if (this.elements.mail) {
				this.on('click', (e) => {
					e.stopPropagation();
					this.shareViaMail();
				}, this.elements.mail);
			}

			return this;
		}

		shareOnFacebook() {
			const values = getMetaValues(document.head, '[property^="og:"]');

			const params = {
				u: values.url || this.url,
				title: values.title || this.title,
				caption: values.site_name,
				description: values.description || this.description,
			};

			const isAbsoluteUrl = /^(https?:)?\/\//i;

			if (isAbsoluteUrl.test(values.image)) {
				params.picture = values.image;
			}

			openWindow('https://www.facebook.com/sharer.php', params, { name: 'Share on Facebook', width: 560, height: 630 });
		}

		shareOnPinterest() {
			const values = getMetaValues(document.head, '[property^="og:"]');

			const params = {
				url: values.url || this.url,
				description: values.description || this.description,
				toolbar: 'no',
				media: values.image,
			};

			openWindow('https://www.pinterest.com/pin/create/button', params, { name: 'Share on Pinterest', width: 740, height: 700 });
		}

		shareOnTwitter() {
			const values = getMetaValues(document.head, '[name^="twitter:"]');

			const params = {
				url: values.url || this.url,
				text: values.title || this.title,
				via: values.site ? values.site.replace('@', '') : undefined,
			};

			openWindow('https://twitter.com/intent/tweet', params, { name: 'Share on Twitter', width: 580, height: 253 });
		}

		shareViaMail() {
			const params = {
				subject: this.title,
				body: `${this.title} (${this.url}) - ${this.description}`,
			};

			openWindow('mailto:', params, { invisible: true });
		}
	},
};

export default share;
