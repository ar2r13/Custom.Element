'use strict'

class HelloApp extends HTMLElement {

	static is = 'hello-app'

	constructor() {
		super()
	}

	connectedCallback() {

	}

	disconnectedCallback() {

	}

	attributeChangedCallback(attr, oldValue, newValue) {

	}

}

window.customElements.define(HelloApp.is, HelloApp)
