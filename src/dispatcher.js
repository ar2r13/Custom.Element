// @flow
'use strict'

const Dispatcher = class { //eslint-disable-line

	stack : Object = {}

	on(prop : string, handler : Function) {
		let stack = this.stack[prop]
		stack instanceof Array
			? stack.push
			: stack = [handler]
		this.stack[prop] = stack
	}

	fire(prop : string, data : any) {
		const stack : Array<Function> = this.stack[prop]
		if(!stack || !stack.length) return
		stack.forEach(handler => handler(data))
	}

}
