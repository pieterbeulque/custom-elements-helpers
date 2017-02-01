import { addMethod, addGetter } from '../internal/decorators';

export default class AttrMedia {

	static attachTo(customElement) {
		// Adds customElement.media
		// @return string 		Value of `media=""` attribute
		addGetter(customElement, 'media', function () {
			return this.el.hasAttribute('media') ? this.el.getAttribute('media') : false;
		});

		// Adds customElement.matchesMedia
		// @return bool 		If the viewport currently matches the specified media query
		addGetter(customElement, 'matchesMedia', function () {
			if (!this.media) {
				return true;
			}

			return 'matchMedia' in window && !!window.matchMedia(this.media).matches;
		});

		// Adds customElements.whenMediaMatches()
		// @return Promise
		addMethod(customElement, 'whenMediaMatches', function () {
			const defer = new Promise((resolve, reject) => {
				let mq;

				const handler = function (e) {
					if (!mq.matches) {
						// Not `reject()`-ing here because
						// we're just waiting for the media query to resolve
						return false;
					}

					resolve();
					mq.removeListener(handler);
				};

				if ('matchMedia' in window) {
					mq = window.matchMedia(this.media);
					mq.addListener(handler);
					handler(mq);
				} else {
					resolve();
				}
			});

			return defer;
		});
	}

}
