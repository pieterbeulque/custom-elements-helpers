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

	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${getterName}`);
	}

	Object.defineProperty(customElement.prototype, getterName, {
		configurable: false,
		get: method,
	});
};

const addSetter = function (customElement, name, method) {
	const setterName = convertAttributeToPropertyName(name);

	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${setterName}`);
	}

	Object.defineProperty(customElement.prototype, setterName, {
		configurable: false,
		set: method,
	});
};

const addProperty = function (customElement, name, getter = null, setter = null) {
	const propertyName = convertAttributeToPropertyName(name);

	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${propertyName}`);
	}

	const noop = function () {};

	Object.defineProperty(customElement.prototype, propertyName, {
		configurable: false,
		get: typeof getter === 'function' ? getter : noop,
		set: typeof setter === 'function' ? setter : noop,
	});
};

export {
	addMethod,
	addGetter,
	addSetter,
	addProperty,
};
