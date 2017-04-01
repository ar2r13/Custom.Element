// @flow
'use strict'

class WebComponent extends HTMLElement {

	_stampNodes : Object = {}

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
		this._detectStamps()
	}

	attachShadow(config : Object) : ShadowRoot {
		let shadow : ShadowRoot
		if(!this.shadowRoot) {
			shadow = super.attachShadow(config)
		}
		shadow.appendChild(this.constructor.template)
		return shadow
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

	_allNodes(nodes : Object = this.shadowRoot.childNodes) : Array<Object> {
		const result : Array<Object> = []

		for(let node of nodes) {
			const childNodes : Object = node.childNodes
			result.push(node)
			if(!childNodes[0]) continue
			result.push(...this._allNodes(childNodes))
		}
		return result
	}

}

//temporary solution
window.WebComponent = WebComponent
