// @flow
'use strict'

import WebComponent from './component.js'

export default function Custom(SuperClass : Object = Object) : WebComponent {
	return class extends WebComponent {}
}

window.Custom = Custom
