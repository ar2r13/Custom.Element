// @flow
'use strict'

class WebComponent extends HTMLElement {
	//TODO: weak maps to private
	//TODO: weak map to event emmiter
	@private_
	__stampNodes : Object = {}

	static get template () : HTMLTemplateElement {
		return window.WebComponent.ownerDocument
			.querySelector('template').content.cloneNode(true)
	}

	static get ownerDocument() : typeof document {
		return document.currentScript
			? document.currentScript.ownerDocument
			: document._currentScript.ownerDocument
	}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.__detectStamps()
	}

	attachShadow(config : Object) : ShadowRoot {
		let shadow : ShadowRoot
		if(!this.shadowRoot) {
			shadow = super.attachShadow(config)
		}
		shadow.appendChild(this.constructor.template)
		return shadow
	}

	__detectStamps() {
		const nodes : Array<Object> = this.allNodes()
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
					const __stampNodes : Array<Text> = this.__stampNodes[prop]
					__stampNodes instanceof Array
						? __stampNodes.push(newNode)
						: this.__stampNodes[prop] = [newNode]
				}

				parentNode.insertBefore(newNode, nextNode)
			})
		}
		this.__stampProps()
	}

	__stampProps() {
		const stampProps : Array<string> = Object.keys(this.__stampNodes)

		for(let prop of stampProps) {
			const _prop : string = '_' + prop

			Object.defineProperty(this.constructor.prototype, _prop, { writable: true })
			Object.defineProperty(this.constructor.prototype, prop, {
				enumerable: true,
				get: function () : String {
					return this[_prop]
				},
				set: function(value : string | number) {
					if(this[_prop] === value) return
					this[_prop] = value

					const shadow : ShadowRoot = this.shadowRoot
					this.__stampNodes[prop].forEach((node : Object, index : number) => {
						shadow.contains(node)
							? node.data = value || ''
							: this.__stampNodes[prop].splice(index, 1)
					})
				}
			})
		}
	}

	allNodes(nodes : Object = this.shadowRoot.childNodes) : Array<Object> {
		const result : Array<Object> = []

		for(let node of nodes) {
			const childNodes : Object = node.childNodes
			result.push(node)
			if(!childNodes[0]) continue
			result.push(...this.allNodes(childNodes))
		}
		return result
	}

}

function private_ (target : Object, key : string, descriptor : Object) : Object {
	descriptor.enumerable = false
	descriptor.configurable = false
	return descriptor
}

//temporary solution
window.WebComponent = WebComponent
