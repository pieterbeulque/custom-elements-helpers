import { defineTests } from 'internal/tests';
import { BaseController, media } from 'index';
import { ajaxForm } from 'index';

// Setup
defineTests('elements/ajax-form', {
	demo: {
		attributes: ajaxForm.attributes,
		controller: class extends ajaxForm.controller {

			onError(err) {

			}

			onSuccess(res) {
				
			}

		}
	},
	before: function (env) {
		const demo = document.getElementById('demo');
		const node = env.node;
		env.node.innerHTML = demo.innerHTML;
		demo.innerHTML = '';
		demo.appendChild(env.node); 
	},
	run: function (env) {
		const { node, customElement } = env;

		suite('Attributes', function () {
			// test('this.media returns a string value', function () {
			// 	chai.assert.equal(typeof customElement.media, 'string');
			// });

			// test('this.media equals the media attribute value', function () {
			// 	chai.assert.equal(node.getAttribute('media'), customElement.media);
			// });

			// test('this.matchesMedia returns a boolean value', function () {
			// 	chai.assert.equal(typeof customElement.matchesMedia, 'boolean');
			// });
		});

		suite('Methods', function () {
			// test('this.whenMediaMatches() returns a Promise', function () {
			// 	chai.assert.equal(typeof customElement.whenMediaMatches().then, 'function');
			// });
		});

	}
});
