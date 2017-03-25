// @flow
'use strict'

class Profiler extends HTMLElement {
	static is : string = 'jl-profiler'
	static observedAttributes : Array<string> = ['hero']

	constructor() {
		super()

	}
}

window.customElements.define(Profiler.is, Profiler)
