import BaseController from '../controllers/base';

const keyTrigger = {
	attributes: [
		{ attribute: 'key', type: 'int' },
	],
	controller: class extends BaseController {
		init() {
			this.elements = this.elements || {};

			if (this.el.hasAttribute('href')) {
				this.elements.target = this;
			} else {
				this.elements.target = this.el.querySelector('[href]');
			}

			return this;
		}

		bind() {
			if (this.elements.target) {
				this.on('keyup', (e) => {
					if (e.which === this.key) {
						e.preventDefault();
						e.stopPropagation();

						this.elements.target.click();
					}
				}, document.body);
			}

			return this;
		}
	},
};

export default keyTrigger;
