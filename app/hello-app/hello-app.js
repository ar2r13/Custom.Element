'use strict'

class HelloApp extends window.WebComponent {

	static is = 'hello-app'

	constructor() {
		super()
	}

	connectedCallback() {
		this._input = this.shadow.querySelector('input')
		this._string = this.shadow.querySelector('span')
		this._input.addEventListener('input', ::this._update)
	}

	_update() {
		let value = this._input.value
		this._string.innerHTML = value
			? 'Hello my name is: ' + value
			: ''
	}

	disconnectedCallback() {

	}

	attributeChangedCallback(attr, oldValue, newValue) {

	}

}

window.customElements.define(HelloApp.is, HelloApp)
