import { addMethod, addGetter } from '../util/util';

export default class AttrMedia {

	static attachTo(customElement) {
		// Adds customElement.media
		// @return string 		Value of `media=""` attribute
		addGetter(customElement, 'media', function () {
			return this.hasAttribute('media') ? this.getAttribute('media') : false;
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
		// @param function		Callback run when this.matchesMedia becomes true
		// @param bool			If true, runs only once, if false, runs everytime media changes into true
		addMethod(customElement, 'whenMediaMatches', function (then, once = true) {
			let hasRun = false;
			let mq;

			const run = function () {
				if (!hasRun || !once) {
					hasRun = true;
					then();
				}
			};

			const handler = function (e) {
				if (!mq.matches) {
					return false;
				}

				run();

				if (!!once) {
					mq.removeListener(handler);
				}
			};

			if ('matchMedia' in window) {
				mq = window.matchMedia(this.media);
				mq.addListener(handler);
				handler(mq);
			} else {
				run();
			}
		});
	}

}
