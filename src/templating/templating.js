// @flow
'use strict'

function Templating (SuperClass : ?HTMLElement) : HTMLElement { // eslint-disable-line no-unused-vars
	const ownerDocument : typeof document = document.currentScript
			? document.currentScript.ownerDocument
			// flow-ignore-line webcomponents-polyfill
			: document._currentScript.ownerDocument
	// flow-ignore-line
	return class extends SuperClass {

		static get template () : DocumentFragment {
			const template : ?HTMLTemplateElement = ownerDocument.querySelector('#' + this.is) || ownerDocument.querySelector('template')
			if(!template) throw new Error('Template not found')
			return template.content.cloneNode(true)
		}

		constructor () {
			super()
			this.attachShadow({mode: 'open'})
		}

		attachShadow (config : Object) : ShadowRoot {
			if(this.shadowRoot) return this.shadowRoot
			const shadow : ShadowRoot = super.attachShadow(config)
			shadow.appendChild(this.constructor.template)
			return shadow
		}

	}
}
