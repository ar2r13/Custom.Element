'use strict'

class HelloApp extends window.WebComponent {

	static is = 'hello-app'

	constructor() {
		super()
		this._findAccessors()
	}

	_findAccessors() {
		const nodes = this.shadow.children
		const regex = /([^\[\[]*?)(?=\]\])/gim
		for(let node of nodes) {
			const accessor = node.innerText.match(regex)
			if(accessor) {
				this[`_${accessor[0]}`] = this[accessor[0]]
				Object.defineProperty(this, accessor[0], {
					set: function (newValue) {
						if(this[`_${accessor[0]}`] === newValue) return
						this[`_${accessor[0]}`] = newValue
						node.innerText = newValue
					},
					get: function() {
						return this[`_${accessor[0]}`]
					}
				})
				node.innerText = this[accessor[0]] || ''
			}
		}
	}

	connectedCallback() {
		this._input = this.shadow.querySelector('input')
		this._string = this.shadow.querySelector('span')
		this._input.addEventListener('input', this::this._update)
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
