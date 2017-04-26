import { addMethod, addGetter } from '../internal/decorators';

export default class AttrMedia {

	static attachTo(customElement) {
		const noop = function () {};

		const watchers = {};

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
				const handler = function (media) {
					if (media.matches) {
						resolve();
						media.removeListener(handler);
					}
				};

				if ('matchMedia' in window) {
					watchers[this.media] = watchers[this.media] || window.matchMedia(this.media);
					watchers[this.media].addListener(() => handler(watchers[this.media]));
					handler(watchers[this.media]);
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
				const handler = function (media) {
					if (media.matches) {
						resolve();
						media.removeListener(handler);
					}
				};

				if ('matchMedia' in window) {
					watchers[this.media] = watchers[this.media] || window.matchMedia(this.media);
					watchers[this.media].addListener(() => handler(watchers[this.media]));
					handler(watchers[this.media]);
				} else {
					resolve();
				}
			});

			return defer;
		});

		addMethod(customElement, 'watchMedia', function watchMedia(match = noop, unmatch = noop) {
			const handler = function (media) {
				if (media.matches) {
					match();
				} else {
					unmatch();
				}
			};

			if ('matchMedia' in window) {
				watchers[this.media] = watchers[this.media] || window.matchMedia(this.media);
				watchers[this.media].addListener(() => handler(watchers[this.media]));
				handler(watchers[this.media]);
			}
		});
	}

}
