# Project Carbonium

*Carbonium* - is a lightweight library to create your own custom HTML elements, using web standard [Web Component](https://www.w3.org/standards/techs/components#w3c_all) API.

###### *Installing:*
```bash
bower i carbonium --save

# For older browser you need to install polyfill (https://github.com/webcomponents/webcomponentsjs)
bower i webcomponentsjs --save
```

###### *Usage:*
```html
index.html

<html lang="en">
	<head>
		...
		<script src="bower_components/webcomponentsjs/webcomponents-loader.js" defer></script>
		<link rel="import" async href="my-component.html">
	</head>
	<body>
		<my-component></my-component>
	</body>
</html>
```

```html
my-component.html

<link rel="import" href="bower_components/carbonium/carbonium.html">

<template>
	<style>
		/* styles */
	</style>
	<input type="text" ::value="this.userName" oninput="this.userName = value">
	((this.greeting))
</template>

<script type="text/javascript">
	class MyComponent extends Custom.Element {

		static get is() { return 'my-component' }
		static get observedProperties () { return ['userName', 'greeting'] }

		constructor() {
			super()
			this.userName = 'Arthur'
		}

		set userName (value) {
			this.greeting = value
				? "Hello " + value
				: ''
		}

	}
	window.customElements.define(MyComponent.is, MyComponent.element)
</script>
```
