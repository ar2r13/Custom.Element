// @flow
'use strict'

class WebComponent extends HTMLElement {

	_template : HTMLTemplateElement
	shadow : ShadowRoot

	constructor() {
		super()
		this._attachShadow()
		this._analyzeDom()
	}

	_analyzeDom() {
		const nodes : Array<Object> = this._allNodes(this.shadow.childNodes)
		const regexp : RegExp = /\[\[\s*([^\W+\d+\W+]\w+)\s*]]/gim

		for(let node of nodes) {
			if(!node.data || node.nodeType !== 3) continue

			const stamps : Array<[]> = []
			let stamp : Array<mixed>

			while ((stamp = regexp.exec(node.data))) {
				stamps.push(stamp)
			}

			if(stamps.length) {
				stamps.forEach(_stamp => this._bindStamp(_stamp, _stamp.input))
			}
		}
	}

	_bindStamp([stamp, prop] : Array<string> = stamp, input : String, node : Object) {
		const _prop : String = '_' + prop

		Object.defineProperty(this, _prop, { writable: true })
		Object.defineProperty(this, prop, {
			enumerable: true,
			get: function () : String {
				return this[_prop]
			},
			set: function(value : String) {
				if(this[_prop] === value) return
				this[_prop] = value
				// node.data = input.replace(regexp, ())
			}
		})
	}

	_allNodes(nodes : Object) : Array<Object> {
		const result : Array<Object> = []
		for(let node of nodes) {
			const childNodes : Object = node.childNodes

			result.push(node)

			if(childNodes[0]) {
				result.push(...this._allNodes(childNodes))
			}
		}
		return result
	}

	get template () : HTMLTemplateElement {
		if(!this._template) this.template = void 0
		return this._template
	}

	set template (selector : String = 'template') {
		this._template = this._document().querySelector(selector).content.cloneNode(true)
	}

	_attachShadow() {
		if(!this.shadow) {
			this.shadow = this.attachShadow({mode: 'open'})
		}
		this.shadow.appendChild(this.template)
	}

	_document() : HTMLDocument {
		return document.currentScript
			? document.currentScript.ownerDocument
			: document._currentScript.ownerDocument
	}

}

//temporary solution
window.WebComponent = WebComponent
