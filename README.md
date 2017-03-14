# custom-elements-helper

A collection of Custom Elements helpers for the v1 spec.

## Attributes

Attributes are packages of properties & methods that you can mix in on custom elements controllers.
Most of the time, they're coupled to a corresponding HTML attribute.

### Media

The `media` attribute adds media query support to your custom element.

#### Properties

 - `media` - `string` - Value of the media attribute
 - `matchesMedia` - `boolean` - True when the current viewport matches the media query

#### Methods
 
- `whenMediaMatches()` - Returns a `Promise` that resolves once when the media query first is matched

#### Example usage

The following example will mixin the media attribute.

The `init().render().bind()` cycle from the base controller will only start once the viewport matches the `(min-width: 768px)` media query (because of the `resolve()` override).

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

```html
<foo-bar media="(min-width: 768px)">
</foo-bar>
```

## Elements

### Key Trigger

You can use Key Trigger to bind a key to an anchor. It'll look for the `href` attribute on itself or on the first child that has one and trigger the `click` event on it.

#### Attributes

 - `key` - `integer` - Key code of the key you want to listen for

#### Example usage

```js
import { defineCustomElement, keyTrigger } from 'custom-elements-helpers';

defineCustomElement('my-key-trigger', keyTrigger);
```

```html
<my-key-trigger key="37">
	<a href="/foo">Previous</a>
</my-key-trigger>

<my-key-trigger key="39">
	<a href="/bar">Next</a>
</my-key-trigger>

```

### Smooth State

Smooth State will listen for internal clicks and asynchronously fetch the contents and swap them, allowing you to transition between pages while not losing browser state.

*Warning: this has quite a few known bugs. Use with caution (and test in Safari)*

#### Methods

There are four public hooks where you can trigger animations. Each hook should return the `transition` object it gets passed in as an argument. You can make modifications to this object & they will adapt the transition accordingly.

 - `onBefore()` - Before the `fetch()`
 - `onStart()` - While the page fetch is running, but before it is ready
 - `onReady()` - When the page fetch is ready, but before it is rendered
 - `onAfter()` - After the page fetch is rendered

#### Example usage

*This is kind of complex, example will be added later.*

## Controllers

## Util

## Polyfill

The `custom-elements.js` polyfill from [Polymer / webcomponents.org](https://github.com/webcomponents/webcomponentsjs) is included too.