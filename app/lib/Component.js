// @flow
'use strict'

class WebComponent extends HTMLElement {

	_template : HTMLTemplateElement
	shadow : ShadowRoot

	get template () : HTMLTemplateElement {
		if(!this._template) this.template = void 0
		return this._template
	}

	set template (selector : string = 'template') {
		this._template = this._document().querySelector(selector).content.cloneNode(true)
	}

	constructor() {
		super()
		this._attachShadow()
	}

	connectedCallback() {
		
	}

	disconnectedCallback() {

	}

	attributeChangedCallback(attr : string, oldValue : string, newValue : string) {

	}

	_document() : HTMLDocument {
		return document.currentScript
			? document.currentScript.ownerDocument
			: document._currentScript.ownerDocument
	}

	_attachShadow() {
		this.shadow = this.attachShadow({mode: 'open'})
		this.shadow.appendChild(this.template)
	}

}

//temporary solution
window.WebComponent = WebComponent
