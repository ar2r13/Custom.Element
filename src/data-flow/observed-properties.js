// @flow
'use strict'

function ObservedProperties(SuperClass : HTMLElement) : HTMLElement { // eslint-disable-line no-unused-vars

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

	function observedPropertiesDecorator(target : Object) : HTMLElement {
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
					const accessorGet : boolean = accessor && typeof accessor.get === 'function'
					return accessorGet
						? /*::`*/this::accessor.get()/*::`*/ || privateValue
						: privateValue
				},
				set (value : any) : any {
					const _privates : ?Object = privates.get(this)
					if(!(_privates instanceof Object)) {
						throw new ReferenceError(errorMessage)
					}
					const accessorSet : boolean = accessor && typeof accessor.set === 'function'

					if(_privates[prop] === value) {
						return value
					}

					if(typeof value === 'object') {
						const _this : Object = this
						value = new Proxy(value, {
							set(target : Object, property : string, value : any) : any {
								if(target[property] === value) return true
								target[property] = value
								_this.observables.update(prop, target)
								if(accessorSet) {
									/*::`*/_this::accessor.set(target)/*::`*/
								}
								return true
							}
						})
					}

					_privates[prop] = accessorSet
						? /*::`*/this::accessor.set(value)/*::`*/ || value
						: value
					this.observables.update(prop, _privates[prop])
				}
			})
		}

		return target
	}
}
