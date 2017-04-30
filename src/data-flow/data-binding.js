// @flow
'use strict'

function dataBinding(SuperClass : HTMLElement) : Object { // eslint-disable-line no-unused-vars

	const bindings : WeakMap<Element, Array<Function>> = new WeakMap()
	const stamps : WeakMap<Element, Object> = new WeakMap()

	const stampErrorMessage : string = '[WebComponent] Something went wrong. No stamps storage found.'
	
	// flow-ignore-line
	return class extends SuperClass {
		constructor() {
			super()

			const nodeIterator : NodeIterator <ShadowRoot, Element> = window.document.createNodeIterator(this.shadowRoot, NodeFilter.SHOW_ALL)

			const elements : Array<Element> = []
			const textNodes : Array<Element> = []

			let node
			while ((node = nodeIterator.nextNode())) {
				if(node.nodeType === 1 && node.attributes.length) { // element
					elements.push(node)
				}
				if(node.nodeType === 3 && node.data) { // text node
					textNodes.push(node)
				}
			}

			if(elements.length) {
				bindings.set(this, [])
				elements.forEach(elem => /*::`*/this::detectBinding(elem)/*::`*/)
			}
			if(textNodes.length) {
				stamps.set(this, {})
				textNodes.forEach(node => /*::`*/this::detectStamp(node)/*::`*/)
			}
		}

		connectedCallback() {
			const _bindings : ?Array<Function> = bindings.get(this)
			if (!_bindings) return
			_bindings.forEach(fn => fn())
		}
	}

	function detectStamp(node : Text) {
		if(!node.data || node.nodeType !== 3) return

		const stampSelector : RegExp = /(\[\[\s*[^\W+\d+\W+]\w*\s*]])/gim
		const stampTest : RegExp = /\[\[\s*([^\W+\d+\W+]\w*)\s*]]/i
		const chunks : Array<string> = node.data.split(stampSelector)

		if(!chunks.length) return

		const parentNode : ?Node = node.parentNode || document.body
		const nextNode : ?Node = node.nextSibling

		if(!parentNode) return

		node.remove()

		chunks.forEach((chunck : string) => {
			const test : any = chunck.match(stampTest)
			const prop : string = test ? test[1] : ''
			const data : string = prop ? '' : chunck
			const newNode : Text = document.createTextNode(data)

			if(prop) {
				const _stamps : ?Object = stamps.get(this)

				if(!_stamps) throw new ReferenceError(stampErrorMessage)

				const stampList : Array<Text> = _stamps[prop]

				stampList instanceof Array
					? stampList.push(newNode)
					: _stamps[prop] = [newNode]

				const observedProperties : Array<string> = this.constructor.observedProperties
				if(observedProperties instanceof Array && observedProperties.includes(prop)) {
					this.observables.subscribe(prop, value => /*::`*/this::setStamp(prop, value)/*::`*/)
				}
			}

			parentNode.insertBefore(newNode, nextNode)
		})
	}

	function setStamp(prop : string, value? : any = this[prop]) {
		let shadow = this.shadowRoot
		const stampList : ?Object = stamps.get(this)

		if(!stampList) throw new ReferenceError(stampErrorMessage)

		stampList[prop].forEach((node : Object, index : number) => {
			if(!shadow) return
			const stampValue : string = value === undefined || null
				? ''
				: value + ''
			shadow.contains(node)
				? node.data = stampValue
				: this.stamps[prop].splice(index, 1)
		})
	}

	function detectBinding(elem : Element) {
		const bindingList : ?Array<Function> = bindings.get(this)
		const errorMessage : string = '[WebComponent] Something went wrong. No stamps storage found.'

		if(!(bindingList instanceof Array)) throw new ReferenceError(errorMessage)

		for (let i = 0; i < elem.attributes.length; i++) {
			const attr : Object = elem.attributes[i]

			if (attr.value.indexOf('::') !== 0) continue

			const prop : string = attr.name
			const bindOperatorRegX : string = '::(\w*)'
			const value : string = attr.value.replace(new RegExp(bindOperatorRegX, 'g'), 'this.$1')
			const exp : Function = new Function('elem', 'prop', `
					elem[prop] = ${value}
				`).bind(this)
			const binding : exp = () => exp(elem, prop)
			const observedProperties : Array <string> = this.constructor.observedProperties

			if (observedProperties instanceof Array) {
				const matchRoot : ?Array <string> = attr.value.match(new RegExp(bindOperatorRegX))
				const rootProp : ?string = matchRoot ? matchRoot[1] : matchRoot

				if (rootProp && observedProperties.includes(rootProp)) {
					this.observables.subscribe(rootProp, binding)
					continue
				}
			}

			bindingList.push(binding)
		}
	}
}
