// @flow
'use strict'

function dataBinding(SuperClass : HTMLElement) : Object { // eslint-disable-line no-unused-vars

	const bindings : WeakMap<Element, Array<Function>> = new WeakMap()
	const stamps : WeakMap<Element, Object> = new WeakMap()

	const dataBindRegX : RegExp = /::this[\.\[]+(\w+)/g

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
			Object.keys(_stamps).forEach(ref => /*::`*/this::setStamp(ref)/*::`*/)
		}
	}

	function detectStamp(node : Text) {
		if(node.nodeType !== 3 || !node.data.trim()) return

		const stampSelector : RegExp = /\[\[(.*::this[\.\[]+\w+.*)]]/gim
		const chunks : Array<string> = node.data.split(stampSelector)

		if(chunks.length <= 1) return

		const parentNode : ?Node = node.parentNode || document.body
		const nextNode : ?Node = node.nextSibling

		if(!parentNode) return

		node.remove()

		chunks.forEach((chunck : string) => {
			const ref : any = chunck.replace(dataBindRegX, 'this.$1')
			const data : string = ref === chunck ? chunck : ''
			const newNode : Text = document.createTextNode(data)

			parentNode.insertBefore(newNode, nextNode)
			if(data || !ref) return

			const _stamps : ?Object = stamps.get(this)
			if(!_stamps) throw new ReferenceError(stampErrorMessage)

			const stampList : Array<Text> = _stamps[ref]

			Array.isArray(stampList)
				? stampList.push(newNode)
				: _stamps[ref] = [newNode]

			const observedProperties : Array<string> = this.constructor.observedProperties
			if(Array.isArray(observedProperties)) {
				let result
				const RegX : RegExp = /this[\.\[]+(\w+)/g
				while((result = RegX.exec(ref))) {
					if(observedProperties.includes(result[1])) {
						this.observables.subscribe(result[1], value => /*::`*/this::setStamp(ref, value)/*::`*/)
					}
				}
			}
		})
	}

	function setStamp(ref : string, value : any) {
		if(value == null) {
			value = new Function(`return ${ref}`).call(this) || ''
		}

		const shadow : ShadowRoot = this.shadowRoot
		const stampList : ?Object = stamps.get(this)

		if(!stampList) throw new ReferenceError(stampErrorMessage)
		if(!shadow) return

		stampList[ref].forEach((node : Object, index : number) => {
			const stampValue : string = value + ''
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

			if (!dataBindRegX.test(attr.value)) continue

			const prop : string = attr.name
			const value : string = attr.value.replace(dataBindRegX, '$.$1')
			const exp : Function = new Function('$', `
					this.${prop} = function () {
						const value = ${value}
						return typeof value === 'function'
							? value.call($, this)
							: value
					}
				`).bind(elem)
			const binding : exp = () => exp(this)
			const observedProperties : Array <string> = this.constructor.observedProperties

			if (Array.isArray(observedProperties)) {
				let result
				const RegX : RegExp = /\$[\.\[]+(\w+)/g
				while((result = RegX.exec(value))) {
					if(observedProperties.includes(result[1])) {
						this.observables.subscribe(result[1], binding)
					}
				}
			}

			bindingList.push(binding)
		}
	}
}
