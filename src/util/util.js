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
		configurable: true,
		get: method
	});
};

const addSetter = function (customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	Object.defineProperty(customElement.prototype, name, {
		configurable: true,
		set: method
	});
};

const addProperty = function (customElement, name, getter = null, setter = null) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(`${customElement.name} already has a property ${name}`);
	}

	if (typeof getter === 'function') {
		addGetter(customElement, name, getter);
	}

	if (typeof setter === 'function') {
		addSetter(customElement, name, setter);
	}
};

export {
	addMethod,
	addGetter,
	addSetter,
	addProperty
};
