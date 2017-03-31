// @flow
'use strict'

class WebComponent extends HTMLElement {

	_template : HTMLTemplateElement

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		console.warn('Proprty "shadow" are deprecated, use native "shadowRoot" property. #usetheplatform')
	}

	get template () : HTMLTemplateElement {
		if(!this._template) this.template = void 0
		return this._template
	}

	set template (selector : string = 'template') {
		this._template = this._document().querySelector(selector).content.cloneNode(true)
	}

	attachShadow(config : Object) : ShadowRoot {
		let shadow : ShadowRoot
		if(!this.shadowRoot) {
			shadow = super.attachShadow(config)
		}
		shadow.appendChild(this.template)
		return shadow
	}

	attributeChangedCallback(attr : string, oldValue : string, newValue : string) {

	}

	_document() : HTMLDocument {
		return document.currentScript
			? document.currentScript.ownerDocument
			: document._currentScript.ownerDocument
	}

}

//temporary solution
window.WebComponent = WebComponent
