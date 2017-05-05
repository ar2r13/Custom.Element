// @flow
'use strict'

function dataBinding(SuperClass : HTMLElement) : Object { // eslint-disable-line no-unused-vars

	const bindings : WeakMap<Element, Array<Function>> = new WeakMap()
	const stamps : WeakMap<Element, Object> = new WeakMap()

	const regX : RegExp = /this[\.\[(]+(\w+)|::(\w+)/

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

			const _stamps : ?Object = stamps.get(this)
			if(!_stamps) return
			Object.keys(_stamps).forEach(prop => /*::`*/this::setStamp(prop)/*::`*/)
		}
	}

	function detectStamp(node : Text) {
		if(!node.data || node.nodeType !== 3) return

		const stampSelector : RegExp = /(\[\[\s*\w+[\.\w]*\s*]])/gim
		const stampTest : RegExp = /\[\[\s*(\w+[\.\w]*)\s*]]/i
		const chunks : Array<string> = node.data.split(stampSelector)

		if(chunks.length <= 1) return

		const parentNode : ?Node = node.parentNode || document.body
		const nextNode : ?Node = node.nextSibling

		if(!parentNode) return

		node.remove()

		chunks.forEach((chunck : string) => {
			const test : any = chunck.match(stampTest)
			const ref : string = test ? test[1] : ''
			const data : string = ref ? '' : chunck
			const newNode : Text = document.createTextNode(data)

			parentNode.insertBefore(newNode, nextNode)
			if(!ref) return

			const _stamps : ?Object = stamps.get(this)
			if(!_stamps) throw new ReferenceError(stampErrorMessage)

			const stampList : Array<Text> = _stamps[ref]

			Array.isArray(stampList)
				? stampList.push(newNode)
				: _stamps[ref] = [newNode]

			const observedProperties : Array<string> = this.constructor.observedProperties
			if(Array.isArray(observedProperties)) {
				const rootProp : ?Array<string> = regX.exec(ref)
				if(!rootProp) return

				if(observedProperties.includes(rootProp[1])) {
					this.observables.subscribe(rootProp[1],
						value => /*::`*/this::setStamp(ref)/*::`*/)
				}
			}
		})
	}

	function setStamp(ref : string) {
		let value
		const testRegX : RegExp = /[\.\[\]()]/
		if(testRegX.test(ref)) {
			value = new Function(`return ${ref}`).call(this)
		}

		let shadow = this.shadowRoot
		const stampList : ?Object = stamps.get(this)

		if(!stampList) throw new ReferenceError(stampErrorMessage)

		stampList[ref].forEach((node : Object, index : number) => {
			if(!shadow) return
			const stampValue : string = value == null
				? ''
				// flow-ignore-line
				: value + ''
			shadow.contains(node)
				? node.data = stampValue
				: this.stamps[ref].splice(index, 1)
		})
	}

	function detectBinding(elem : Element) {
		const bindingList : ?Array<Function> = bindings.get(this)
		const errorMessage : string = '[WebComponent] Something went wrong. No stamps storage found.'

		if(!Array.isArray(bindingList)) throw new ReferenceError(errorMessage)

		for (let i = 0; i < elem.attributes.length; i++) {
			const attr : Object = elem.attributes[i]

			if (!regX.test(attr.value)) continue

			const prop : string = attr.name
			const bindOperatorRegX : RegExp = /::(\w*)/ig
			const value : string = attr.value.replace(bindOperatorRegX, 'elem.$1')
			const exp : Function = new Function('elem', `
					let value = ${value}
					elem.${prop} = typeof value === 'function'
						? value.bind(this)
						: value
				`).bind(this)
			const binding : exp = () => exp(elem)
			const observedProperties : Array <string> = this.constructor.observedProperties

			if (Array.isArray(observedProperties)) {
				const propRegX : RegExp = /this[\.\[](\w+)/g
				let result

				while((result = propRegX.exec(value))) {
					if(observedProperties.includes(result[1])) {
						this.observables.subscribe(result[1], binding)
					}
				}
			}

			bindingList.push(binding)
		}
	}
}
