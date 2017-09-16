module.exports = {
    "extends": "mrhenry",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "env": {
        "browser": true,
        "es6": true
    },
    "rules": {
        // Custom Elements Helpers specific
        "no-param-reassign": [ "error", { "props": true, "ignorePropertyModificationsFor": [ "customElement" ] } ],
        "class-methods-use-this": [ "error", { "exceptMethods": [
            // BaseController
            "resolve", "init", "render", "bind",
            // SmoothState
            "onBefore", "onStart", "onReady", "onAfter"
        ] } ]
    }
};