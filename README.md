# custom-elements-helper

A collection of Custom Elements helpers for the v1 spec.

## Attributes

Attributes are packages of properties & methods that you can mix in on custom elements controllers.
Most of the time, they're coupled to a corresponding HTML attribute.

### Media

The `media` attribute adds media query support to your custom element.

#### Properties

 - `media` - Value of the media attribute
 - `matchesMedia` - Boolean that is true when the current viewport matches the media query specified in the attribute

#### Methods
 
- `whenMediaMatches()` - Returns a Promise that resolves once when the media query first is matched

#### Example usage

The following example will mixin the media attribute.

The BaseControllers `init().render().bind()` cycle will only start once the viewport matches the `(min-width: 768px)` media query.

```html
<foo-bar media="(min-width: 768px)">
</foo-bar>
```

```js
import { defineCustomElement, BaseController, AttrMedia as media } from 'custom-elements-helpers';

defineCustomElement('foo-bar', {
	attributes: [ media ],
	controller: class extends BaseController {
	
		resolve() {
			return Promise.all([
				super.resolve(),
				this.whenMediaMatches()
			]);
		}
		
	}
});

```

## Elements

## Controllers

## Util

## Polyfill

The `custom-elements.js` polyfill from [Polymer / webcomponents.org](https://github.com/webcomponents/webcomponentsjs) is included too.