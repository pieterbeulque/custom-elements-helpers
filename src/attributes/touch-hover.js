import { addMethod, addGetter } from '../internal/decorators';
import { getPath } from '../util/events';

export default class AttrTouchHover {
	static attachTo(customElement) {
		let isTouch = false;
		let isTouched = false;

		const touchClass = 'is-touch';
		const hoverClass = 'is-touch-hover';

		addGetter(customElement, 'touchHover', function getTouchHoverAttribute() {
			if (this.el.hasAttribute('touch-hover')) {
				// @todo - Support different values for touch-hover
				// `auto`        detect based on element
				// `toggle`      always toggle hover on/off (this might block clicks)
				// `passthrough` ignore hover, directly trigger action
				return 'auto';
			}

			return false;
		});

		addMethod(customElement, 'enableTouchHover', function enableTouchHover() {
			this.on('touchstart', () => {
				isTouch = true;
				this.el.classList.add(touchClass);
			}, this.el, { useCapture: true });

			this.on('touchstart', (e) => {
				const path = getPath(e);

				// Remove hover when tapping outside the DOM node
				if (isTouched && !path.includes(this.el)) {
					isTouch = false;
					isTouched = false;
					this.el.classList.remove(hoverClass);
				}
			}, document.body, { useCapture: true });

			this.on('click', (e) => {
				if (this.touchHover) {
					const hasAction = this.el.getAttribute('href') !== '#';

					if (!isTouched && !hasAction) {
						e.preventDefault();
					}

					if (isTouch) {
						if (hasAction) {
							if (!isTouched) {
								// First tap, enable hover, block tap
								e.preventDefault();
								isTouched = true;
							} else {
								// Second tap, don't block tap, disable hover
								isTouched = false;
							}
						} else {
						// Act as a simple on/off switch
							isTouched = !isTouched;
						}

						this.el.classList.toggle(hoverClass, isTouched);
					}
				}
			}, this.el, { useCapture: true });
		});
	}
}
