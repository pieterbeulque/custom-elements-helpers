'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
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









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var BaseController = function () {
	function BaseController(el) {
		var _this = this;

		classCallCheck(this, BaseController);

		this.el = el;

		this.resolve().then(function () {
			_this.el.classList.add('is-resolved');
			return _this.init().render().bind();
		});
	}

	createClass(BaseController, [{
		key: 'destroy',
		value: function destroy() {
			this.el.classList.remove('is-resolved');
			return this.unbind();
		}
	}, {
		key: 'resolve',
		value: function resolve() {
			return new Promise(function (resolve, reject) {
				if (document.readyState === 'complete') {
					return resolve();
				}

				var handler = function handler() {
					if (document.readyState === 'complete') {
						document.removeEventListener('readystatechange', handler, false);
						return resolve();
					}
				};

				document.addEventListener('readystatechange', handler, false);
			});
		}
	}, {
		key: 'init',
		value: function init() {
			return this;
		}
	}, {
		key: 'bind',
		value: function bind() {
			return this;
		}
	}, {
		key: 'render',
		value: function render() {
			return this;
		}
	}, {
		key: 'unbind',
		value: function unbind() {
			if (this._handlers) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this._handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var listener = _step.value;

						listener.target.removeEventListener(listener.event, listener.handler, listener.options);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}

			return this;
		}
	}, {
		key: 'on',
		value: function on(event, handler) {
			var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
			var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

			event = event.trim();

			this._handlers = this._handlers || [];

			if (!target) {
				target = this.el;
			}

			var selector = void 0;
			var wrappedHandler = void 0;

			if (event.indexOf(' ') > 0) {
				selector = event.split(' ').splice(1).join(' ').trim();

				if (selector.length > 0) {
					event = event.split(' ').shift();

					wrappedHandler = function wrappedHandler(e) {
						var matches = false;

						if (!e.path) {
							e.path = [e.target];
							var node = e.target;

							while (node.parentNode) {
								node = node.parentNode;
								e.path.push(node);
							}
						}

						for (var i = 0; i < e.path.length; i++) {
							var tag = e.path[i];

							if (tag.matches(selector)) {
								matches = true;
								break;
							}

							if (tag === document.body) {
								break;
							}

							if (tag === target) {
								break;
							}
						}

						if (matches) {
							handler(e);
						}
					};
				}
			}

			if (!wrappedHandler) {
				wrappedHandler = handler;
			}

			var listener = { target: target, selector: selector, event: event, handler: wrappedHandler, options: options };

			listener.target.addEventListener(listener.event, listener.handler, listener.options);

			this._handlers.push(listener);

			return this;
		}
	}, {
		key: 'off',
		value: function off(event) {
			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			var selector = void 0;

			if (event.indexOf(' ') > 0) {
				selector = event.split(' ').splice(1).join(' ').trim();

				if (selector.length > 1) {
					event = event.split(' ').shift();
				}
			}

			var listener = this._handlers.find(function (h) {
				return h.selector === selector && h.event === event && (!target || h.target === target);
			});

			listener.target.removeEventListener(listener.event, listener.handler, listener.options);
		}
	}]);
	return BaseController;
}();

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
		configurable: false,
		get: method
	});
};

var addProperty = function addProperty(customElement, name) {
	var getter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	var setter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

	if (typeof customElement.prototype[name] !== 'undefined') {
		console.warn(customElement.name + ' already has a property ' + name);
	}

	var noop = function noop() {};

	Object.defineProperty(customElement.prototype, name, {
		configurable: false,
		get: typeof getter === 'function' ? getter : noop,
		set: typeof setter === 'function' ? setter : noop
	});
};

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
				return this.el.hasAttribute('media') ? this.el.getAttribute('media') : false;
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
			// @return Promise
			addMethod(customElement, 'whenMediaMatches', function () {
				var _this = this;

				var defer = new Promise(function (resolve, reject) {
					var mq = void 0;

					var handler = function handler(e) {
						if (!mq.matches) {
							// Not `reject()`-ing here because
							// we're just waiting for the media query to resolve
							return false;
						}

						resolve();
						mq.removeListener(handler);
					};

					if ('matchMedia' in window) {
						mq = window.matchMedia(_this.media);
						mq.addListener(handler);
						handler(mq);
					} else {
						resolve();
					}
				});

				return defer;
			});
		}
	}]);
	return AttrMedia;
}();

var smoothState = {
	attributes: [],
	controller: function (_BaseController) {
		inherits(controller, _BaseController);

		function controller() {
			classCallCheck(this, controller);
			return possibleConstructorReturn(this, (controller.__proto__ || Object.getPrototypeOf(controller)).apply(this, arguments));
		}

		createClass(controller, [{
			key: 'init',
			value: function init() {
				var href = window.location.href;
				var title = document.title;

				window.history.pushState({ href: href, title: title }, title, href);

				return this;
			}
		}, {
			key: 'bind',
			value: function bind() {
				var _this2 = this;

				this.on('popstate', function (e) {
					if (e.state && e.state.href) {
						_this2.goTo(e.state.href, false).catch(function (err) {
							console.warn('Could not run popstate to', e.state.href);
							console.warn('Error:', err);
						});
					}
				}, window);

				this.on('click a', function (e) {
					var node = e.target;
					var path = Object.assign([], e.path);

					while (path.length > 0 && node && node.tagName && node.tagName.toLowerCase() !== 'a') {
						node = path.shift();

						// Not an `<a>` in the path if we arrived at the smoothState element
						if (node === _this2.el) {
							return;
						}
					}

					if (node.classList && node.classList.contains('js-mr-smooth-state-disable')) {
						return;
					}

					e.preventDefault();
					e.stopPropagation();

					var href = node.getAttribute('href');
					_this2.goTo(href).catch(function (err) {
						console.warn('Could not navigate to', href);
						console.warn('Error:', err);
					});
				}, document.body);
			}
		}, {
			key: 'goTo',
			value: function goTo(href) {
				var _this3 = this;

				var pushState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

				var parseHTML = function parseHTML(html) {
					var doc = document.implementation.createHTMLDocument();
					doc.documentElement.innerHTML = html;

					var title = doc.title;
					var container = doc.body.getElementsByTagName('mr-smooth-state');

					var content = container.length === 0 ? doc.body : container[0];

					return { title: title, content: content };
				};

				var renderNodes = function renderNodes(content, container) {
					container.innerHTML = '';

					for (var i = content.children.length - 1; i >= 0; i--) {
						var child = content.children[i];

						if (container.firstChild) {
							container.insertBefore(child, container.firstChild);
						} else {
							container.appendChild(child);
						}
					}
				};

				return new Promise(function (resolve, reject) {
					window.dispatchEvent(new CustomEvent('smoothState:before'));

					document.body.classList.add('is-loading');

					return _this3.onBefore(href).then(function () {
						fetch(href).then(function (res) {
							return res.text();
						}).then(function (html) {
							var _parseHTML = parseHTML(html),
							    title = _parseHTML.title,
							    content = _parseHTML.content;

							window.dispatchEvent(new CustomEvent('smoothState:start'));

							_this3.onStart().then(function () {
								window.dispatchEvent(new CustomEvent('smoothState:ready'));

								_this3.onReady(content).then(function (content) {
									window.requestAnimationFrame(function () {
										renderNodes(content, _this3.el);
										document.title = title;

										if (!!pushState) {
											window.history.pushState({ href: href, title: title }, title, href);
										}

										window.requestAnimationFrame(function () {
											document.body.classList.remove('is-loading');

											window.dispatchEvent(new CustomEvent('smoothState:after'));

											_this3.onAfter().then(function () {
												return resolve();
											}).catch(function (err) {
												return reject(err);
											});
										});
									});
								}).catch(function (err) {
									return reject(err);
								});
							}).catch(function (err) {
								return reject(err);
							});
						}).catch(function (err) {
							return reject(err);
						});
					}).catch(function (err) {
						return reject(err);
					});
				});
			}
		}, {
			key: 'onBefore',
			value: function onBefore(to) {
				return Promise.resolve();
			}
		}, {
			key: 'onStart',
			value: function onStart() {
				return Promise.resolve();
			}
		}, {
			key: 'onReady',
			value: function onReady(content) {
				return Promise.resolve(content);
			}
		}, {
			key: 'onAfter',
			value: function onAfter() {
				return Promise.resolve();
			}
		}]);
		return controller;
	}(BaseController)
};

var noop = function noop() {};

var generateStringAttributeMethods$1 = function generateStringAttributeMethods(attribute) {
	var getter = function getter() {
		return this.el.getAttribute(attribute) || undefined;
	};

	var setter = function setter(to) {
		if (!!to) {
			this.el.setAttribute(attribute, to);
		} else {
			this.el.removeAttribute(attribute);
		}
	};

	return { getter: getter, setter: setter };
};

var generateBoolAttributeMethods = function generateBoolAttributeMethods(attribute) {
	var getter = function getter() {
		return !!this.el.hasAttribute(attribute);
	};

	var setter = function setter(to) {
		if (!!to) {
			this.el.setAttribute(attribute, attribute);
		} else {
			this.el.removeAttribute(attribute);
		}
	};

	return { getter: getter, setter: setter };
};

var generateIntegerAttributeMethods = function generateIntegerAttributeMethods(attribute) {
	var getter = function getter() {
		return parseInt(this.el.getAttribute(attribute), 10);
	};

	var setter = function setter(to) {
		var parsed = parseInt(to, 10);

		if (!Number.isNaN(parsed)) {
			this.el.setAttribute(attribute, parsed);
		} else {
			console.warn('Could not set ' + attribute + ' to ' + to);
			this.el.removeAttribute(attribute);
		}
	};

	return { getter: getter, setter: setter };
};

var generateNumberAttributeMethods = function generateNumberAttributeMethods(attribute) {
	var getter = function getter() {
		return parseFloat(this.el.getAttribute(attribute));
	};

	var setter = function setter(to) {
		var parsed = parseFloat(to);

		if (!Number.isNaN(parsed)) {
			this.el.setAttribute(attribute, parsed);
		} else {
			console.warn('Could not set ' + attribute + ' to ' + to);
			this.el.removeAttribute(attribute);
		}
	};

	return { getter: getter, setter: setter };
};

var generateAttributeMethods = function generateAttributeMethods(attribute) {
	var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'string';

	if (type === 'bool') {
		return generateBoolAttributeMethods(name);
	} else if (type === 'int' || type === 'integer') {
		return generateIntegerAttributeMethods(name);
	} else if (type === 'float' || type === 'number') {
		return generateNumberAttributeMethods(name);
	} else if (type === 'string') {
		return generateStringAttributeMethods$1(name);
	} else {
		return { getter: noop, setter: noop };
	}
};

function defineCustomElement(tag) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	// Attach all passed attributes to the passed controller
	if (options.attributes && options.attributes.length) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = options.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var attribute = _step.value;

				// String, sync with actual element attribute
				if (typeof attribute === 'string') {
					var _generateStringAttrib = generateStringAttributeMethods(attribute),
					    getter = _generateStringAttrib.getter,
					    setter = _generateStringAttrib.setter;

					addProperty(options.controller, attribute, getter, setter);
				} else if (typeof attribute.attachTo === 'function') {
					attribute.attachTo(options.controller);
				} else if ((typeof attribute === 'undefined' ? 'undefined' : _typeof(attribute)) === 'object') {
					var type = attribute.type || 'string';
					var name = attribute.attribute;

					var _generateAttributeMet = generateAttributeMethods(name, type),
					    _getter = _generateAttributeMet.getter,
					    _setter = _generateAttributeMet.setter;

					addProperty(options.controller, name, _getter, _setter);
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	}

	return customElements.define(tag, function (_HTMLElement) {
		inherits(_class, _HTMLElement);

		function _class() {
			classCallCheck(this, _class);
			return possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
		}

		createClass(_class, [{
			key: 'connectedCallback',
			value: function connectedCallback() {
				this.controller = new options.controller(this);
			}
		}, {
			key: 'disconnectedCallback',
			value: function disconnectedCallback() {
				this.controller.destroy();
			}
		}]);
		return _class;
	}(HTMLElement));
}

// Base Controller

exports.BaseController = BaseController;
exports.media = AttrMedia;
exports.smoothState = smoothState;
exports.defineCustomElement = defineCustomElement;
