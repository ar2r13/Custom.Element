// @flow
'use strict'

class WebComponent extends HTMLElement {

	static get template () : HTMLTemplateElement {
		return window.WebComponent.ownerDocument
			.querySelector('template').content.cloneNode(true)
	}

	static get ownerDocument() : HTMLDocument {
		return document.currentScript
			? document.currentScript.ownerDocument
			: document._currentScript.ownerDocument
	}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		console.warn('Proprty "shadow" are deprecated, use native "shadowRoot" property. #usetheplatform')
	}

	attachShadow(config : Object) : ShadowRoot {
		let shadow : ShadowRoot
		if(!this.shadowRoot) {
			shadow = super.attachShadow(config)
		}
		shadow.appendChild(this.constructor.template)
		return shadow
	}

}

//temporary solution
window.WebComponent = WebComponent
