import { addMethod, addGetter } from '../internal/decorators';

export default class AttrMedia {

	static attachTo(customElement) {
		const noop = function () {};

		let mq;

		// Adds customElement.media
		// @return string 		Value of `media=""` attribute
		addGetter(customElement, 'media', function getMediaAttribute() {
			return this.el.hasAttribute('media') ? this.el.getAttribute('media') : false;
		});

		// Adds customElement.matchesMedia
		// @return bool 		If the viewport currently matches the specified media query
		addGetter(customElement, 'matchesMedia', function matchesMedia() {
			if (!this.media) {
				return true;
			}

			return 'matchMedia' in window && !!window.matchMedia(this.media).matches;
		});

		// Adds customElements.whenMediaMatches()
		// @return Promise
		addMethod(customElement, 'whenMediaMatches', function whenMediaMatches() {
			const defer = new Promise((resolve) => {
				const handler = function () {
					if (mq.matches) {
						resolve();
						mq.removeListener(handler);
					}
				};

				if ('matchMedia' in window) {
					mq = mq || window.matchMedia(this.media);
					mq.addListener(handler);
					handler(mq);
				} else {
					resolve();
				}
			});

			return defer;
		});

		// Adds customElements.whenMediaUnmatches()
		// @return Promise
		addMethod(customElement, 'whenMediaUnmatches', function whenMediaUnmatches() {
			const defer = new Promise((resolve) => {
				const handler = function () {
					if (mq.matches) {
						resolve();
						mq.removeListener(handler);
					}
				};

				if ('matchMedia' in window) {
					mq = mq || window.matchMedia(this.media);
					mq.addListener(handler);
					handler(mq);
				} else {
					resolve();
				}
			});

			return defer;
		});

		addMethod(customElement, 'watchMedia', function watchMedia(match = noop, unmatch = noop) {
			const handler = function () {
				if (mq.matches) {
					match();
				} else {
					unmatch();
				}
			};

			if ('matchMedia' in window) {
				mq = mq || window.matchMedia(this.media);
				mq.addListener(handler);
				handler(mq);
			}
		});
	}

}
