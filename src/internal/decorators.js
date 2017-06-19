const convertAttributeToPropertyName = function (attribute) {
	return attribute.split('-').reduce((camelcased, part, index) => {
		if (index === 0) {
			return part;
		}

		return camelcased + part[0].toUpperCase() + part.substr(1);
	});
};

const addMethod = function (customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	customElement.prototype[name] = method;
};

const addGetter = function (customElement, name, method) {
	const getterName = convertAttributeToPropertyName(name);

	if (typeof customElement.prototype[getterName] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${getterName}`);
	}

	Object.defineProperty(customElement.prototype, getterName, {
		configurable: false,
		get: method,
	});

	return getterName;
};

const addSetter = function (customElement, name, method) {
	const setterName = convertAttributeToPropertyName(name);

	if (typeof customElement.prototype[setterName] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${setterName}`);
	}

	Object.defineProperty(customElement.prototype, setterName, {
		configurable: false,
		set: method,
	});

	return setterName;
};

const addProperty = function (customElement, name, getter = null, setter = null) {
	const propertyName = convertAttributeToPropertyName(name);

	if (typeof customElement.prototype[propertyName] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${propertyName}`);
	}

	const noop = function () {};

	const property = {
		configurable: false,
		get: typeof getter === 'function' ? getter : noop,
		set: typeof setter === 'function' ? setter : noop,
	};

	const descriptor = Object.getOwnPropertyDescriptor(customElement.prototype, propertyName);

	if (descriptor) {
		if (typeof descriptor.set === 'function') {
			const existing = descriptor.set;

			property.set = function set(to) {
				existing.call(this, to);
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

	Object.defineProperty(customElement.prototype, propertyName, property);

	return propertyName;
};

export {
	addMethod,
	addGetter,
	addSetter,
	addProperty,
};
