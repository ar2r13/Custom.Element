// @flow
'use strict'

class WebComponent extends HTMLElement {

	_template : HTMLTemplateElement
	_stampNodes : Object = {}
	shadow : ShadowRoot

	constructor() {
		super()
		this._attachShadow()
		this._detectStamps()
	}

	_detectStamps() {
		const nodes : Array<Object> = this._allNodes()
		const stampSelector : RegExp = /(\[\[\s*[^\W+\d+\W+]\w*\s*]])/gim
		const stampTest : RegExp = /\[\[\s*([^\W+\d+\W+]\w*)\s*]]/i

		for(let node of nodes) {
			if(!node.data || node.nodeType !== 3) continue

			const chunks : Array<string> = node.data.split(stampSelector)

			if(!chunks.length) continue

			const parentNode : Object = node.parentNode
			const nextNode : Object = node.nextSibling

			node.remove()

			chunks.forEach((chunck : string) => {
				const test : any = chunck.match(stampTest)
				const prop : string = test ? test[1] : test
				const data : string = prop ? '' : chunck
				const newNode : Text = document.createTextNode(data)

				if(prop) {
					const _stampNodes : Array<Text> = this._stampNodes[prop]
					_stampNodes instanceof Array
						? _stampNodes.push(newNode)
						: this._stampNodes[prop] = [newNode]
				}

				parentNode.insertBefore(newNode, nextNode)
			})
		}
		this._stampProps()
	}

	_stampProps() {
		const stampProps : Array<string> = Object.keys(this._stampNodes)

		for(let prop of stampProps) {
			const _prop : string = '_' + prop

			Object.defineProperty(this, _prop, { writable: true })
			Object.defineProperty(this, prop, {
				enumerable: true,
				get: function () : String {
					return this[_prop]
				},
				set: function(value : string | number) {
					if(this[_prop] === value) return
					this[_prop] = value
					this._stampNodes[prop].forEach(node => node.data = value || '')
				}
			})
		}
	}

	_allNodes(nodes : Object = this.shadow.childNodes) : Array<Object> {
		const result : Array<Object> = []

		for(let node of nodes) {
			const childNodes : Object = node.childNodes
			result.push(node)
			if(!childNodes[0]) continue
			result.push(...this._allNodes(childNodes))
		}
		return result
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

	_document() : HTMLDocument {
		return document.currentScript
			? document.currentScript.ownerDocument
			: document._currentScript.ownerDocument
	}

}

//temporary solution
window.WebComponent = WebComponent
