import { defineTests } from 'internal/tests';
import { BaseController, media } from 'index';

// Setup
defineTests('attributes/media', {
	demo: {
		attributes: [ media ],
		controller: class extends BaseController {

			bind() {
				this.watchMedia(
					() => this.el.style.color = 'green',
					() => this.el.style.color = 'red'
				);

				return this;
			}

		}
	},
	before: function (env) {
		const node = env.node;
		node.setAttribute('media', '(min-width: 768px)');
		node.innerHTML = 'This is a block element that has the media attribute.';
		document.getElementById('demo').appendChild(node);
	},
	run: function (env) {
		const { node, customElement } = env;

		suite('Attributes', function () {
			test('this.media returns a string value', function () {
				chai.assert.equal(typeof customElement.media, 'string');
			});

			test('this.media equals the media attribute value', function () {
				chai.assert.equal(node.getAttribute('media'), customElement.media);
			});

			test('this.matchesMedia returns a boolean value', function () {
				chai.assert.equal(typeof customElement.matchesMedia, 'boolean');
			});
		});

		suite('Methods', function () {
			test('this.whenMediaMatches() returns a Promise', function () {
				chai.assert.equal(typeof customElement.whenMediaMatches().then, 'function');
			});
		});

	}
});
