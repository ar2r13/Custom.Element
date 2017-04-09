module.exports = {
    "parser": "babel-eslint",
    "plugins": [
        "flowtype",
		"html"
    ],
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
    ],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab",
			{
				"SwitchCase": 1
			}
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-console": 0,
		"no-unused-vars": [
			2,
			{ "args": "none" }
		],
		"no-cond-assign": [
			2,
			"except-parens"
		],
		"flowtype/boolean-style": [
			"error",
			"boolean"
		],
		"flowtype/generic-spacing": [
			"error",
			"never"
		],
		"flowtype/require-parameter-type": [
			"error",
			{
				"excludeArrowFunctions": "expressionsOnly"
			}
		],
		"flowtype/require-return-type": [
            2,
            "always",
            {
              "excludeArrowFunctions": "expressionsOnly"
            }
        ],
		"flowtype/require-variable-type": [
            2,
            {
              "excludeVariableTypes": {
            	"var": true,
                "let": true,
                "const": false,
              }
            }
        ],
		"flowtype/space-after-type-colon": [
			"error",
			"always"
		],
		"flowtype/space-before-type-colon": [
			"error",
			"always"
		]
    },
	"settings": {
    	"flowtype": {
			"onlyFilesWithFlowAnnotation": true
		}
	}
};
