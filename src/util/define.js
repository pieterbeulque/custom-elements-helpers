import { addProperty } from '../internal/decorators';
import { generateAttributeMethods } from '../internal/attribute-methods-generator';

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

				const { getter, setter } = generateAttributeMethods(name, type);

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
