'use strict'

class HelloApp extends window.WebComponent {

	static is = 'hello-app'

	constructor() {
		super()
	}

	set userName(value) {
		switch (value) {
			case 'Bruce Wayne':
				this.hero = 'the richest man in Gotham'
				break
			case 'Barry Allen':
				this.hero = 'the fastest man on Earth'
				break
			case 'Batman' :
				this.hero = 'The Dark Knight of Gotham'
				break
			default:
				this.hero = 'don\' know, who am i'
		}
	}

	connectedCallback() {
		this._input = this.shadowRoot.querySelector('input')
		this._string = this.shadowRoot.querySelector('span')
		this._input.value = this.userName ? this.userName : ''
		this._input.addEventListener('input', ::this.update)
	}

	update() {
		this.userName = this._input.value
	}

	disconnectedCallback() {
		//LOL
	}

	attributeChangedCallback(attr, oldValue, newValue) {

	}

}

// function observable (target, key, descriptor) {
// 	const _key = '_' + key
// 	descriptor.get = function() {
// 		return this[_key]
// 	}
// 	descriptor.set = function(value) {
// 		target[_key] = value
// 		target.dispatcher.fire(key, value)
// 	}
// 	return descriptor
// }

window.customElements.define(HelloApp.is, HelloApp)
