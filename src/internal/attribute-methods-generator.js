const noop = function () {};

const generateStringAttributeMethods = function (attribute) {
	const getter = function () {
		return this.el.getAttribute(attribute) || undefined;
	};

	const setter = function (to) {
		const parsed = to && to.toString ? to.toString() : undefined;
		const oldValue = this[attribute];

		if (parsed === oldValue) {
			return;
		}

		if (parsed) {
			this.el.setAttribute(attribute, parsed);
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
		const parsed = typeof to === 'string' || !!to;
		const oldValue = this[attribute];

		if (parsed === oldValue) {
			return;
		}

		if (parsed) {
			this.el.setAttribute(attribute, '');
		} else {
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

const generateIntegerAttributeMethods = function (attribute) {
	const getter = function () {
		return parseInt(this.el.getAttribute(attribute), 10);
	};

	const setter = function (to) {
		const parsed = parseInt(to, 10);
		const oldValue = this[attribute];

		if (parsed === oldValue) {
			return;
		}

		if (!Number.isNaN(parsed)) {
			this.el.setAttribute(attribute, parsed);
		} else {
			console.warn(`Could not set ${attribute} to ${to}`);
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

const generateNumberAttributeMethods = function (attribute) {
	const getter = function () {
		return parseFloat(this.el.getAttribute(attribute));
	};

	const setter = function (to) {
		const parsed = parseFloat(to);
		const oldValue = this[attribute];

		if (parsed === oldValue) {
			return;
		}

		if (!Number.isNaN(parsed)) {
			this.el.setAttribute(attribute, parsed);
		} else {
			console.warn(`Could not set ${attribute} to ${to}`);
			this.el.removeAttribute(attribute);
		}
	};

	return { getter, setter };
};

const generateAttributeMethods = function (attribute, type = 'string') {
	if (type === 'bool') {
		return generateBoolAttributeMethods(attribute);
	} else if (type === 'int' || type === 'integer') {
		return generateIntegerAttributeMethods(attribute);
	} else if (type === 'float' || type === 'number') {
		return generateNumberAttributeMethods(attribute);
	} else if (type === 'string') {
		return generateStringAttributeMethods(attribute);
	}
	return { getter: noop, setter: noop };
};

export {
	generateBoolAttributeMethods,
	generateIntegerAttributeMethods,
	generateStringAttributeMethods,
	generateNumberAttributeMethods,
	generateAttributeMethods,
};
