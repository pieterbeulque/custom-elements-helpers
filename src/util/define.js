import { convertAttributeToPropertyName, addProperty } from '../internal/decorators';
import { generateAttributeMethods } from '../internal/attribute-methods-generator';
import waitForDOMReady from './dom-ready';

const CONTROLLER = Symbol('controller');

const registerElement = function (tag, options) {
	const observedAttributes = options.observedAttributes || [];

	customElements.define(tag, class extends options.extends.class {
		static get observedAttributes() {
			return observedAttributes;
		}

		attributeChangedCallback(attribute, oldValue, newValue) {
			if (oldValue === newValue) {
				return;
			}

			if (!this[CONTROLLER]) {
				return;
			}

			const propertyName = convertAttributeToPropertyName(attribute);

			const prototype = Object.getPrototypeOf(this[CONTROLLER]);
			const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);

			if (descriptor && descriptor.set) {
				this[CONTROLLER][propertyName] = newValue;
			}

			// If for argument `current` the method
			// `currentChangedCallback` exists, trigger
			const callback = this[CONTROLLER][`${propertyName}ChangedCallback`];

			if (typeof callback === 'function') {
				callback.call(this[CONTROLLER], oldValue, newValue);
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
			if (typeof this[CONTROLLER].unbind === 'function') {
				this[CONTROLLER].unbind();
			}

			if (typeof this[CONTROLLER].destroy === 'function') {
				this[CONTROLLER].destroy();
			}

			this[CONTROLLER] = null;
		}
	}, options.extends.tag ? { extends: options.extends.tag } : undefined);
};

const registerAttribute = (function registerAttribute() {
	const handlers = [];

	const observer = new MutationObserver((records) => {
		const mutations = Array.from(records);

		mutations.forEach((mutation) => {
			handlers.forEach((handler) => handler(mutation));
			return mutation;
		});
	});


	return function register(attribute, options = {}) {
		waitForDOMReady().then(() => {
			const nodeIsSupported = function (node) {
				return node instanceof options.extends.class;
			};

			const attach = function (node) {
				const el = node;
				el[CONTROLLER] = new options.controller(el);
				return el;
			};

			const detach = function (node) {
				const el = node;

				if (el[CONTROLLER]) {
					el[CONTROLLER].destroy();
					el[CONTROLLER] = null;
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
						const addedNodes = Array.from(mutation.addedNodes, (node) => {
							if (node.nodeType === Node.ELEMENT_NODE) {
								return node;
							}

							return undefined;
						}).filter((node) => node);

						addedNodes.forEach((node) => {
							if (nodeIsSupported(node) && node.hasAttribute(attribute)) {
								attach(node);
							}

							if (node.hasChildNodes()) {
								const nested = Array.from(node.querySelectorAll(`[${attribute}]`)).filter((nestedNode) => nodeIsSupported(nestedNode));

								if (nested && nested.length > 0) {
									nested.forEach((nestedNode) => {
										attach(nestedNode);
									});
								}
							}
						});
					}

					if (mutation.removedNodes) {
						const removedNodes = Array.from(mutation.removedNodes, (node) => {
							if (node.nodeType === Node.ELEMENT_NODE) {
								return node;
							}

							return undefined;
						}).filter((node) => node);

						removedNodes.forEach((node) => {
							// Clean up if the DOM node gets removed before the
							// attribute mutation has triggered
							if (nodeIsSupported(node) && node.hasAttribute(attribute)) {
								detach(node);
							}

							if (node.hasChildNodes()) {
								const nested = Array.from(node.querySelectorAll(`[${attribute}]`)).filter((nestedNode) => nodeIsSupported(nestedNode));

								if (nested && nested.length > 0) {
									nested.forEach((nestedNode) => {
										detach(nestedNode);
									});
								}
							}
						});
					}
				}
			});

			observer.observe(document.body, {
				attributes: true,
				subtree: true,
				childList: true,
				attributeFilter: [attribute],
			});

			// Look for current on DOM ready
			Array.from(document.body.querySelectorAll(`[${attribute}]`), (el) => {
				if (!nodeIsSupported(el)) {
					console.warn('Custom attribute', attribute, 'added on non-supported element');
					return false;
				}

				if (el[CONTROLLER]) {
					return el;
				}

				return attach(el);
			});
		});
	};
}());

const addAttributesToController = function (controller, attributes = []) {
	return attributes.map((attribute) => {
		// String, sync with actual element attribute
		if (typeof attribute === 'string') {
			const { getter, setter } = generateAttributeMethods(attribute, 'string');
			addProperty(controller, attribute, getter, setter);
			return attribute;
		}

		if (typeof attribute === 'object') {
			const type = attribute.type || 'string';
			const name = attribute.attribute;
			const { getter, setter } = generateAttributeMethods(name, type);
			addProperty(controller, name, getter, setter);
			return name;
		}

		if (typeof attribute.attachTo === 'function') {
			const name = attribute.attachTo(controller);

			if (name) {
				return name;
			}

			return false;
		}

		return false;
	}).filter((attribute) => !!attribute);
};

export default function defineCustomElement(tag, options = {}) {
	// Validate tag
	const isValidTag = tag.split('-').length > 1;

	// Validate type
	const type = ['element', 'attribute'].includes(options.type) ? options.type : 'element';

	if (type === 'element' && !isValidTag) {
		throw new Error(`${tag} is not a valid Custom Element name.`);
	}

	if (type === 'attribute') {
		// eslint-disable-next-line no-console
		console.warn('Using { type: attribute } since v2.6.0. Try extending a native element instead using is="".');
	}

	// Validate attributes
	const attributes = Array.isArray(options.attributes) ? options.attributes : [];

	// Validate extend
	const extend = (() => {
		const fallback = { class: HTMLElement, tag: undefined };

		if (!options.extends) {
			return fallback;
		}

		// Support the old, non-object syntax for options.extend
		if (options.extends.prototype instanceof HTMLElement) {
			return { class: options.extends, tag: undefined };
		}

		// The new syntax needs { class: HTMLButtonElement, tag: 'button' }
		if (!options.extends.class || !options.extends.tag) {
			return { class: HTMLElement, tag: undefined };
		}

		const parent = options.extends.class;

		return {
			class: parent.prototype instanceof HTMLElement ? parent : HTMLElement,
			tag: typeof options.extends.tag === 'string' ? options.extends.tag : undefined,
		};
	})();

	const observedAttributes = addAttributesToController(options.controller, attributes);

	const validatedOptions = {
		type,
		extends: extend,
		attributes,
		controller: options.controller,
		observedAttributes,
	};

	if (type === 'attribute') {
		return registerAttribute(tag, validatedOptions);
	}

	return registerElement(tag, validatedOptions);
}
