// @flow
'use strict'

const privates : WeakMap<WebComponent, Object> = new WeakMap()

class WebComponent extends HTMLElement {
	// flow-ignore Dispatcher imports as html-import
	dispatcher : Dispatcher = new Dispatcher() //eslint-disable-line
	bindings : Array<Function> = []
	stamps : Object = {}
	elems : Object = {}

	static get ownerDocument() : typeof document {
		return document.currentScript
			? document.currentScript.ownerDocument
			// flow-ignore _currentScript is for polyfil
			: document._currentScript.ownerDocument
	}

	constructor() {
		super()
		// flow-ignore flow is not support new.target || this.constructor
		const observedProperties : Array<string> = this.constructor.observedProperties
		privates.set(this, {})
		// flow-ignore flow is not support ::bind syntax
		this.attachShadow({mode: 'open'})
		/*::`*/this::detectStamps()/*::`*/
		/*::`*/this::detectBindings()/*::`*/
		if(observedProperties instanceof Array) {
			observedProperties.forEach(prop => /*::`*/this::defineObserver(prop)/*::`*/)
		}
	}

	connectedCallback() {
		this.bindings.forEach(fn => fn())
		Object.keys(this.stamps).forEach(prop => /*::`*/this::setStamp(prop)/*::`*/)
	}

	attachShadow(config : Object) : ShadowRoot {
		if(this.shadowRoot) return this.shadowRoot
		let shadow = super.attachShadow(config)
		// flow-ignore flow is not support new.target
		shadow.appendChild(this.constructor.template)
		return shadow
	}

	allNodes(root : ?Node = this.shadowRoot) : Array<Node> {
		if(!root) return []

		const nodes : NodeList<Node> = root.childNodes
		const result : Array<Node> = []

		for(let node of nodes) {
			result.push(node)
			if(!node.childNodes[0]) continue
			result.push(...this.allNodes(node))
		}

		return result
	}

}

function allElements(root : ShadowRoot) : Array<Element> {
	const elements : Array<Element> = []
	const nodeIterator : NodeIterator<ShadowRoot, Element> = window.document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT,
		(elem : Element) => elem.attributes.length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)

	let elem
	while((elem = nodeIterator.nextNode())) {
		elements.push(elem)
	}

	return elements
}

function detectBindings () {
	const elements : Array<Element> = allElements(this.shadowRoot)

	elements.forEach((elem : Element) => {
		if(elem.id) this.elems[elem.id] = elem
		for(let attr of elem.attributes) {
			if(attr.value.indexOf('::') === 0) {
				const prop : string = attr.name
				const bindOperator : string = '::(\w*)'
				const value : string  = attr.value.replace(new RegExp(bindOperator, 'g'), 'this.$1')
				const exp : Function = new Function('elem', 'prop', `
						elem[prop] = ${value}
				`).bind(this)
				const binding : exp = () => exp(elem, prop)

				const matchRoot : ?Array<string> = attr.value.match(new RegExp(bindOperator))
				const rootProp : ?string = matchRoot ? matchRoot[1] : matchRoot

				const observedProperties : Array<string> = this.constructor.observedProperties
				if(rootProp && observedProperties instanceof Array && observedProperties.includes(rootProp)) {
					this.dispatcher.on(rootProp, binding)
				} else {
					this.bindings.push(binding)
				}
			}
		}
	})
}

function detectStamps () {
	const nodes : Array<Text> = this.allNodes()
	const stampSelector : RegExp = /(\[\[\s*[^\W+\d+\W+]\w*\s*]])/gim
	const stampTest : RegExp = /\[\[\s*([^\W+\d+\W+]\w*)\s*]]/i

	for(let node of nodes) {
		//Text nodes
		if(!node.data || node.nodeType !== 3) continue

		const chunks : Array<string> = node.data.split(stampSelector)

		if(!chunks.length) continue

		const parentNode : ?Node = node.parentNode || document.body
		const nextNode : ?Node = node.nextSibling

		if(!parentNode) continue

		node.remove()

		chunks.forEach((chunck : string) => {
			const test : any = chunck.match(stampTest)
			const prop : string = test ? test[1] : ''
			const data : string = prop ? '' : chunck
			const newNode : Text = document.createTextNode(data)

			if(prop) {
				const stamps : Array<Text> = this.stamps[prop]
				stamps instanceof Array
					? stamps.push(newNode)
					: this.stamps[prop] = [newNode]

				const observedProperties : Array<string> = this.constructor.observedProperties
				if(observedProperties instanceof Array && observedProperties.includes(prop)) {
					this.dispatcher.on(prop, value => /*::`*/this::setStamp(prop, value)/*::`*/)
				}
			}

			parentNode.insertBefore(newNode, nextNode)
		})
	}
}

function setStamp(prop : string, value? : any = this[prop]) {
	let shadow = this.shadowRoot
	this.stamps[prop].forEach((node : Object, index : number) => {
		if(!shadow) return
		const stampValue : string = value === undefined || null
			? ''
			: value + ''
		shadow.contains(node)
			? node.data = stampValue
			: this.stamps[prop].splice(index, 1)
	})
}

function defineObserver(prop : string) {
	const proto : Object = Object.getPrototypeOf(Object.getPrototypeOf(this))
	Object.defineProperty(proto, prop, {
		enumerable: true,
		get: function () : String {
			// flow-ignore acces of computed property
			return privates.get(this)[prop]
		},
		set: function(value : any) {
			const _privates : ?Object = privates.get(this)

			const message : string = '[WebComponent] Something went wrong. No storage found.'
			if(!_privates) throw new ReferenceError(message)

			if(_privates[prop] === value) return
			_privates[prop] = value
			this.dispatcher.fire(prop, value)
		}
	})
}
