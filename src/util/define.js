import { addProperty } from '../internal/decorators';
import { generateAttributeMethods } from '../internal/attribute-methods-generator';

const CONTROLLER = Symbol('controller');

export default function defineCustomElement(tag, options = {}) {
	const observedAttributes = [];

	// Attach all passed attributes to the passed controller
	if (options.attributes && options.attributes.length) {
		options.attributes.forEach((attribute) => {
			// String, sync with actual element attribute
			if (typeof attribute === 'string') {
				const { getter, setter } = generateAttributeMethods(attribute, 'string');

				addProperty(options.controller, attribute, getter, setter);
				observedAttributes.push(attribute);
			} else if (typeof attribute.attachTo === 'function') {
				attribute.attachTo(options.controller);
			} else if (typeof attribute === 'object') {
				const type = attribute.type || 'string';
				const name = attribute.attribute;
				const { getter, setter } = generateAttributeMethods(name, type);

				addProperty(options.controller, name, getter, setter);
				observedAttributes.push(name);
			}
		});
	}

	return customElements.define(tag, class extends HTMLElement {

		static get observedAttributes() {
			return observedAttributes;
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (oldValue === newValue) {
				return;
			}

			if (!this[CONTROLLER]) {
				return;
			}

			const prototype = Object.getPrototypeOf(this[CONTROLLER]);
			const descriptor = Object.getOwnPropertyDescriptor(prototype, name);

			if (descriptor && descriptor.set) {
				this[CONTROLLER][name] = newValue;
			}
		}

		constructor() {
			super();

			observedAttributes.forEach((attribute) => {
				if (typeof this[attribute] !== 'undefined') {
					console.warn(`Requested syncing on attribute '${attribute}' that already has defined behavior`);
				}

				Object.defineProperty(this, attribute, {
					configurable: false,
					enumerable: false,
					get: () => this[CONTROLLER][attribute],
					set: (to) => { this[CONTROLLER][attribute] = to; },
				});
			});
		}

		connectedCallback() {
			this[CONTROLLER] = new options.controller(this);
		}

		disconnectedCallback() {
			this[CONTROLLER].destroy();
		}

	});
}
