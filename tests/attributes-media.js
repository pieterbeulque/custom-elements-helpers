import { defineCustomElement, BaseController, media } from '../src/index.js';

'use strict';

const assert = window.chai.assert;
const mocha = window.mocha;

mocha.setup('tdd');

let instance;

const controller = class extends BaseController {

	init() {
		instance = this;
		return this;
	}

	bind() {
		console.log('bind');

		this.whenMediaMatches().then(() => {
			console.log(1);
		});

		this.whenMediaUnmatches().then(() => {
			console.log(2);
		});

		this.watchMedia(
			() => {
				this.el.style.color = 'green';
				console.log('Media matched');
			},
			() => {
				console.log('Media unmatched');
				this.el.style.color = 'red';
			}
		);

		return this;
	}

	render() {
		mocha.run();
		return this;
	}

	whenMediaUnmatches() {
		const defer = new Promise((resolve) => {
			let mq;

			const handler = function () {
				if (!mq.matches) {
					resolve();
					mq.removeListener(handler);
				}
			};

			if ('matchMedia' in window) {
				mq = window.matchMedia(this.media);
				mq.addListener(handler);
				handler(mq);
			} else {
				resolve();
			}
		});

		return defer;
	}

	watchMedia(match = function () {}, unmatch = function () {}) {
		let mq;

		const handler = function () {
			if (mq.matches) {
				match();
			} else {
				unmatch();
			}
		};

		if ('matchMedia' in window) {
			mq = window.matchMedia(this.media);
			mq.addListener(handler);
			handler(mq);
		}
	}

};

defineCustomElement('test-attr-media', {
	attributes: [ media ],
	controller: controller
});

const node = document.createElement('test-attr-media');
node.setAttribute('media', '(min-width: 768px)');
node.innerHTML = 'This is a block element that has the media attribute.';

document.getElementsByClassName('js-demo')[0].appendChild(node);

customElements.whenDefined('test-attr-media')

suite('Attributes', function () {
	test('this.media returns a string value', function () {
		assert.equal(typeof instance.media, 'string');
	});

	test('this.media equals the media attribute value', function () {
		assert.equal(node.getAttribute('media'), instance.media);
	});

	test('this.matchesMedia returns a boolean value', function () {
		assert.equal(typeof instance.matchesMedia, 'boolean');
	});
});

suite('Methods', function () {
	test('this.whenMediaMatches() returns a Promise', function () {
		assert.equal(typeof instance.whenMediaMatches().then, 'function');
	});
});
