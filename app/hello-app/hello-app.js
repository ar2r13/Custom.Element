'use strict'

class HelloApp extends window.WebComponent {

	static is = 'hello-app'
	userName = 'Bruce Wayne'

	constructor() {
		super()
	}

	connectedCallback() {
		this._input = this.shadow.querySelector('input')
		this._string = this.shadow.querySelector('span')
<<<<<<< HEAD
		this._input.value = this.userName
=======
>>>>>>> master
		this._input.addEventListener('input', ::this._update)
	}

	_update() {
		this.userName = this._input.value
	}

	disconnectedCallback() {

	}

	attributeChangedCallback(attr, oldValue, newValue) {

	}

}

window.customElements.define(HelloApp.is, HelloApp)
