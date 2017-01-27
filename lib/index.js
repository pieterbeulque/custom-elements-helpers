'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var addMethod = function addMethod(customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(customElement.name + ' already has a property ' + name);
	}

	customElement.prototype[name] = method;
};

var addGetter = function addGetter(customElement, name, method) {
	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(customElement.name + ' already has a property ' + name);
	}

	Object.defineProperty(customElement.prototype, name, {
		configurable: true,
		get: method
	});
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var AttrMedia = function () {
	function AttrMedia() {
		classCallCheck(this, AttrMedia);
	}

	createClass(AttrMedia, null, [{
		key: 'attachTo',
		value: function attachTo(customElement) {
			// Adds customElement.media
			// @return string 		Value of `media=""` attribute
			addGetter(customElement, 'media', function () {
				return this.hasAttribute('media') ? this.getAttribute('media') : false;
			});

			// Adds customElement.matchesMedia
			// @return bool 		If the viewport currently matches the specified media query
			addGetter(customElement, 'matchesMedia', function () {
				if (!this.media) {
					return true;
				}

				return 'matchMedia' in window && !!window.matchMedia(this.media).matches;
			});

			// Adds customElements.whenMediaMatches()
			// @param function		Callback run when this.matchesMedia becomes true
			// @param bool			If true, runs only once, if false, runs everytime media changes into true
			addMethod(customElement, 'whenMediaMatches', function (then) {
				var once = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

				var hasRun = false;
				var mq = void 0;

				var run = function run() {
					if (!hasRun || !once) {
						hasRun = true;
						then();
					}
				};

				var handler = function handler(e) {
					if (!mq.matches) {
						return false;
					}

					run();

					if (!!once) {
						mq.removeListener(handler);
					}
				};

				if ('matchMedia' in window) {
					mq = window.matchMedia(this.media);
					mq.addListener(handler);
					handler(mq);
				} else {
					run();
				}
			});
		}
	}]);
	return AttrMedia;
}();

exports.AttrMedia = AttrMedia;
