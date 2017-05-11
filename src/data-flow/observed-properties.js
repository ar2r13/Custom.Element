// @flow
'use strict'

function observedProperties(SuperClass : HTMLElement) : Object { // eslint-disable-line no-unused-vars

	const privates : WeakMap<Element, Object> = new WeakMap()

	class Observable {
		stack : Object = {}
		subscribe(prop : string, handler : Function) {
			let stack = this.stack[prop]
			stack instanceof Array
				? stack.push(handler)
				: stack = [handler]
			this.stack[prop] = stack
		}
		update(prop : string, data : any) {
			const stack : Array<Function> = this.stack[prop]
			if (!stack || !stack.length) return
			stack.forEach(handler => handler(data))
		}
	}

	// flow-ignore-line
	return class extends SuperClass {
		constructor() {
			super()
			const observedProperties : Array<string> = this.constructor.observedProperties
			if (observedProperties instanceof Array) {
				privates.set(this, {})
				this.observables = new Observable()
			}
		}
		static get element() : typeof SuperClass {
			return observedPropertiesDecorator(super.element || this)
		}
	}

	function observedPropertiesDecorator(target : Object) : HTMLElement { // eslint-disable-line no-unused-vars
		const observedProperties : Array<string> = target.observedProperties
		if (!(observedProperties instanceof Array)) return target

		observedProperties.forEach(prop => defineObserver(prop))

		function defineObserver(prop : string) {
			const accessor : Object = Object.getOwnPropertyDescriptor(target.prototype, prop)
			const errorMessage : string = '[WebComponent] Something went wrong. No private storage found.'
			Object.defineProperty(target.prototype, prop, {
				get () : any {
					const _privates : ?Object = privates.get(this)
					if(!(_privates instanceof Object)) {
						throw new ReferenceError(errorMessage)
					}
					const privateValue : any = _privates[prop]
					return (accessor && typeof accessor.get === 'function')
						? /*::`*/this::accessor.get()/*::`*/ || privateValue
						: privateValue
				},
				set (value : any) : any {
					const _privates : ?Object = privates.get(this)
					if(!(_privates instanceof Object)) {
						throw new ReferenceError(errorMessage)
					}

					if(_privates[prop] === value) return value

					_privates[prop] = (accessor && typeof accessor.set === 'function')
						? /*::`*/this::accessor.set(value)/*::`*/ || value
						: value
					this.observables.update(prop, _privates[prop])
				}
			})
		}

		return target
	}
}
