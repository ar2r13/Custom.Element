'use strict'

class HelloApp extends HTMLElement {

	static is = 'hello-app'

	constructor() {
		super()
		const doc = document.currentScript.ownerDocument
		const template = doc.querySelector('template')
		this._root = this.attachShadow({mode: 'open'})
		this._root.appendChild(template.content.cloneNode(true))
	}

	connectedCallback() {
		this._input = this._root.querySelector('input')
		this._string = this._root.querySelector('span')
		this._input.addEventListener('input', this::this._update)
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
