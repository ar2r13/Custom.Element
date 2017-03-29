// @flow
'use strict'

class WebComponent extends HTMLElement {

	_template : HTMLTemplateElement

	shadow : ShadowRoot

	constructor() {
		super()
		this._attachShadow()
	}

	get template () : HTMLTemplateElement {
		if(!this._template) this.template = void 0
		return this._template
	}

	set template (selector : string = 'template') {
		this._template = this._document().querySelector(selector).content.cloneNode(true)
	}

	_attachShadow() {
		if(!this.shadow) {
			this.shadow = this.attachShadow({mode: 'open'})
		}
		this.shadow.appendChild(this.template)
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
