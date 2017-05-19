// @flow
'use strict'

function DataBinding(SuperClass : HTMLElement) : Object { // eslint-disable-line no-unused-vars

	const bindings : WeakMap<Element, Array<Function>> = new WeakMap()
	const stamps : WeakMap<Element, Object> = new WeakMap()

	const stampErrorMessage : string = '[WebComponent] Something went wrong. No stamps storage found.'
	const rootPropRegX : RegExp = /this[\.\[]+(\w+)/g

	// flow-ignore-line
	return class extends SuperClass {
		constructor() {
			super()
			const nodeIterator : NodeIterator <ShadowRoot, Element> = window.document.createNodeIterator(this.shadowRoot, NodeFilter.SHOW_ALL)
			const elements : Array<Element> = []
			const textNodes : Array<Element> = []

			let node
			while ((node = nodeIterator.nextNode())) {
				if(node.nodeType === 1 && node.attributes.length) {
					elements.push(node) //element
					continue
				}
				if(node.nodeType === 3 && node.data) {
					textNodes.push(node) // text node
					continue
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

		const stampSelector : RegExp = /(\(\(.+?\)\))/gim
		const chunks : Array<string> = node.data.split(stampSelector)

		if(chunks.length <= 1) return

		const parentNode : ?Node = node.parentNode || document.body
		const nextNode : ?Node = node.nextSibling

		if(!parentNode) return

		node.remove()

		chunks.forEach((chunck : string) => {
			const ref : any = chunck.match(stampSelector)
			const data : string = ref ? '' : chunck
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
				while((result = rootPropRegX.exec(ref))) {
					if(observedProperties.includes(result[1])) {
						this.observables.subscribe(result[1], value => /*::`*/this::setStamp(ref)/*::`*/)
					}
				}
			}
		})
	}

	function setStamp(ref : string, value : any) {
		const shadow : ShadowRoot = this.shadowRoot
		const stampList : ?Object = stamps.get(this)

		if(!stampList) throw new ReferenceError(stampErrorMessage)
		if(!shadow) return

		const newValue : any = (node : Text) : any => {
			value = value == null
				? /*::`*/this::evaluatedExp(node, ref)/*::`*/
				: value
			return value
		}

		stampList[ref].forEach((node : Text, index : number) => {
			const stampValue : string = newValue(node) == null
				? ''
				: typeof value === 'object'
					? JSON.stringify(value)
					: value + ''
			shadow.contains(node)
				? node.data = stampValue
				: this.stamps[ref].splice(index, 1)
		})
	}

	function detectBinding(elem : {[string] : any}) {
		const bindingList : ?Array<Function> = bindings.get(this)
		const errorMessage : string = '[WebComponent] Something went wrong. No stamps storage found.'

		if(!Array.isArray(bindingList)) throw new ReferenceError(errorMessage)

		for (let i = 0; i < elem.attributes.length; i++) {
			const attr : Object = elem.attributes[i]
			const prop : string = attr.name
			const prefix : string = prop.substr(0, 2)

			const availablePrefixes : Array<string> = [
				'on',
				'::'
			]

			if(!attr.value.length || !availablePrefixes.includes(prefix)) continue

			const binding : Function = () => {
				const value : any = /*::`*/this::evaluatedExp(elem, attr.value)/*::`*/
				switch (prefix) {
					case 'on':
						elem[prop] = (() => typeof value === 'function'
								? value.call(this, event, elem)
								: /*::`*/this::evaluatedExp(elem, attr.value)/*::`*/
						).bind(this)
						break
					case '::':
						elem.removeAttribute(prop)
						elem[prop.substr(2)] = value
						break
				}
			}

			const observedProperties : Array <string> = this.constructor.observedProperties

			if (Array.isArray(observedProperties)) {
				let result
				while((result = rootPropRegX.exec(attr.value))) {
					if(observedProperties.includes(result[1])) {
						this.observables.subscribe(result[1], binding)
					}
				}
			}

			bindingList.push(binding)
		}
	}

	function evaluatedExp (context : Element, exp : string) : any {
		return new Function('$', `let v;with($){try{v=${exp}}catch(e){console.error(e);return '['+e.name+']: '+e.message}return v}`)
			.call(this, context)
	}
}
