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

	__bench(count) {
		const t0 = performance.now()
		for(let i = 0; i < count; i++) {
			this.userName = i
		}
		const t1 = performance.now()
		console.log(t1 - t0)
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
