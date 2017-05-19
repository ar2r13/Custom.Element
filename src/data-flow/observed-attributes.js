// @flow
'use strict'

function ObservedAttributes(SuperClass : HTMLElement) : HTMLElement { // eslint-disable-line no-unused-vars
	// flow-ignore-line
	return class extends SuperClass {
		attributeChangedCallback(attr : string, oldValue : string, newValue : string) {
			if(oldValue === newValue) return
			this[attr] = newValue
		}
	}
}
