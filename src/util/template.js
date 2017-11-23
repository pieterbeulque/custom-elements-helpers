export default class Template {
	constructor(selector, scope = document.body) {
		this.template = scope.querySelector(`template${selector}`);
	}

	render(values = {}) {
		const fragment = this.template.content.cloneNode(true);

		Object.entries(values).forEach(([selector, value]) => {
			try {
				const part = fragment.querySelector(selector);

				if (part) {
					if (typeof value === 'string') {
						part.textContent = value;
					} else if (typeof value === 'object' && !Array.isArray(value)) {
						Object.assign(part, value);
					}
				}
			} catch (e) {
				console.warn(`Invalid template replacement for selector \`${selector}\``);
			}
		});

		return fragment;
	}
}
