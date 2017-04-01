'use strict'

class HelloApp extends window.WebComponent {

	static is = 'hello-app'
	userName = 'Bruce Wayne'
	hero = 'Batman'

	constructor() {
		super()
	}

	connectedCallback() {
		this._input = this.shadowRoot.querySelector('input')
		this._string = this.shadowRoot.querySelector('span')
		this._input.value = this.userName
		this._input.addEventListener('input', ::this._update)
	}

	__bench(name, count) {
		console.time(name)
		for(let i = 0; i < count; i++) {
			this.userName = i
			this.people24 = i
		}
		console.timeEnd(name)
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
