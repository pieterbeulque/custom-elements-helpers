import { addProperty } from '../internal/decorators';

const generateStringAttributeMethods = function (attribute) {
	const getter = function () {
		return this.el.getAttribute(attribute) || undefined;
	};

	const setter = function (to) {
		if (!!to) {
			this.el.setAttribute(attribute, to);
		} else {
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

const generateBoolAttributeMethods = function (attribute) {
	const getter = function () {
		return !!this.el.hasAttribute(attribute);
	};

	const setter = function (to) {
		if (!!to) {
			this.el.setAttribute(attribute, attribute);
		} else {
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

export default function defineCustomElement(tag, options = {}) {
	// Attach all passed attributes to the passed controller
	if (options.attributes && options.attributes.length) {
		for (const attribute of options.attributes) {
			// String, sync with actual element attribute
			if (typeof attribute === 'string') {
				const { getter, setter } = generateStringAttributeMethods(attribute);
				addProperty(options.controller, attribute, getter, setter);
			} else if (typeof attribute.attachTo === 'function') {
				attribute.attachTo(options.controller);
			} else if (typeof attribute === 'object') {
				const type = attribute.type || 'string';
				const name = attribute.attribute;

				const { getter, setter } = (function () {
					if (type === 'string') {
						return generateStringAttributeMethods(name);
					} else if (type === 'bool') {
						return generateBoolAttributeMethods(name);
					}
				}());

				addProperty(options.controller, name, getter, setter);
			}
		}
	}

	return customElements.define(tag, class extends HTMLElement {

		connectedCallback() {
			this.controller = new options.controller(this);
		}

		disconnectedCallback() {
			this.controller.destroy();
		}

	});
};
