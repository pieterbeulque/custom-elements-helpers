export default class Template {
	constructor(selector, scope = document.body) {
		this.template = scope.querySelector(`template${selector}`);
	}

	render(values = {}) {
		if (!this.template.content) {
			this.template.content = document.createDocumentFragment();

			const childNodes = Array.from(this.template.childNodes);

			childNodes.forEach((childNode) => {
				this.template.content.appendChild(childNode);
			});
		}

		const fragment = this.template.content.cloneNode(true);

		Object.entries(values).forEach(([selector, value]) => {
			try {
				const part = fragment.querySelector(selector);

				if (part) {
					if (typeof value === 'string') {
						part.textContent = value;
					} else if (typeof value === 'object' && !Array.isArray(value)) {
						Object.entries(value).forEach(([attribute, v]) => {
							if (typeof v === 'object' && !Array.isArray(value)) {
								Object.assign(part[attribute], v);
							} else {
								Object.assign(part, { [attribute]: v });
							}
						}, {});
					}
				}
			} catch (e) {
				console.warn(`Invalid template replacement for selector \`${selector}\``);
			}
		});

		return fragment;
	}
}
