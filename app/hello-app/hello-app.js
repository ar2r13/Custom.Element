'use strict'

class HelloApp extends Custom(HTMLElement) { //eslint-disable-line

	static is = 'hello-app'
	static observedProperties = ['userName', 'hero']

	constructor() {
		super()
		this.userName = 'Batman'
	}

	get userName () {
		return super.userName
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
				this.hero = 'the ' + value
		}
		super.userName = value
	}

	connectedCallback() {
		super.connectedCallback()
		this._input = this.shadowRoot.querySelector('input')
		this._string = this.shadowRoot.querySelector('span')
		this._input.value = this.userName ? this.userName : ''
		this._input.addEventListener('input', ::this.update)
	}

	update() {
		this.userName = this._input.value
	}

}

window.customElements.define(HelloApp.is, HelloApp)
