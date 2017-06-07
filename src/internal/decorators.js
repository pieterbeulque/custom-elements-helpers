const addMethod = function (customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	customElement.prototype[name] = method;
};

const addGetter = function (customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	Object.defineProperty(customElement.prototype, name, {
		configurable: false,
		get: method,
	});
};

const addSetter = function (customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	Object.defineProperty(customElement.prototype, name, {
		configurable: false,
		set: method,
	});
};

const addProperty = function (customElement, name, getter = null, setter = null) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	const noop = function () {};

	const property = {
		configurable: false,
		get: typeof getter === 'function' ? getter : noop,
		set: typeof setter === 'function' ? setter : noop,
	};

	const descriptor = Object.getOwnPropertyDescriptor(customElement.prototype, name);

	if (descriptor) {
		if (typeof descriptor.set === 'function') {
			const generated = property.set;
			const existing = descriptor.set;

			property.set = function set(to) {
				const sync = (parsed) => {
					generated.call(this, parsed);
				};

				existing.call(this, { to, sync });
			};
		}

		if (typeof descriptor.get === 'function') {
			const generated = property.get;
			const existing = descriptor.get;

			property.get = function get() {
				const value = existing.call(this);

				if (typeof value !== 'undefined') {
					return value;
				}

				return generated.call(this);
			};
		}
	}

	Object.defineProperty(customElement.prototype, name, property);
};

export {
	addMethod,
	addGetter,
	addSetter,
	addProperty,
};
