import { addProperty } from '../internal/decorators';
import { generateAttributeMethods } from '../internal/attribute-methods-generator';
import waitForDOMReady from './dom-ready';

const registerElement = function (tag, options) {
	customElements.define(tag, class extends HTMLElement {

		connectedCallback() {
			this.controller = new options.controller(this);
		}

		disconnectedCallback() {
			this.controller.destroy();
		}

	});
};

const registerAttribute = (function registerAttribute() {
	const handlers = [];

	const observer = new MutationObserver((mutations) => {
		Array.from(mutations, (mutation) => {
			handlers.forEach((handler) => handler(mutation));
			return mutation;
		});
	});

	return function register(attribute, options = {}) {
		waitForDOMReady().then(() => {
			const root = options.root || document.body;
			const on = options.on || HTMLElement;

			const nodeIsSupported = function (node) {
				if (Array.isArray(on)) {
					return on.some((supported) => node instanceof supported);
				}

				return node instanceof on;
			};

			const attach = function (node) {
				const el = node;
				el.controller = new options.controller(el);
				return el;
			};

			const detach = function (node) {
				const el = node;

				if (el.controller) {
					el.controller.destroy();
					el.controller = null;
				}

				return el;
			};

			// Setup observers
			handlers.push((mutation) => {
				if (mutation.type === 'attributes' && nodeIsSupported(mutation.target)) {
					// Attribute changed on supported DOM node type
					const node = mutation.target;

					if (node.hasAttribute(attribute)) {
						attach(node);
					} else {
						detach(node);
					}
				} else if (mutation.type === 'childList') {
					// Handle added nodes
					if (mutation.addedNodes) {
						Array.from(mutation.addedNodes, (node) => {
							if (nodeIsSupported(node) && node.hasAttribute(attribute)) {
								return attach(node);
							}

							return null;
						});
					}

					if (mutation.removedNodes) {
						Array.from(mutation.removedNodes, (node) => {
							// Clean up if the DOM node gets removed before the
							// attribute mutation has triggered
							if (nodeIsSupported(node) && node.hasAttribute(attribute)) {
								return detach(node);
							}

							return null;
						});
					}
				}
			});

			observer.observe(root, {
				attributes: true,
				subtree: true,
				childList: true,
				attributeFilter: [attribute],
			});

			// Look for current on DOM ready
			Array.from(root.querySelectorAll(`[${attribute}]`), (el) => {
				if (!nodeIsSupported(el)) {
					console.warn('Custom attribute', attribute, 'added on non-supported element', on.name);
					return false;
				}

				if (el.controller) {
					return el;
				}

				return attach(el);
			});
		});
	};
}());

const addAttributeToController = function (controller, attribute) {
	// String, sync with actual element attribute
	if (typeof attribute === 'string') {
		const { getter, setter } = generateAttributeMethods(attribute, 'string');
		addProperty(controller, attribute, getter, setter);
	} else if (typeof attribute.attachTo === 'function') {
		attribute.attachTo(controller);
	} else if (typeof attribute === 'object') {
		const type = attribute.type || 'string';
		const name = attribute.attribute;

		const { getter, setter } = generateAttributeMethods(name, type);

		addProperty(controller, name, getter, setter);
	}
};

export default function defineCustomElement(tag, options = {}) {
	// Validate tag
	const validated = tag.split('-').length > 1;
	let type = options.type || 'element';

	if (!validated && type === 'element') {
		console.warn(tag, 'is not a valid Custom Element name, registering as attribute');
		type = 'attribute';
	}

	// Attach all passed attributes to the passed controller
	if (options.attributes && options.attributes.length) {
		options.attributes.forEach((attribute) => {
			addAttributeToController(options.controller, attribute);
		});
	}

	if (type === 'attribute') {
		return registerAttribute(tag, options);
	}

	return registerElement(tag, options);
}
