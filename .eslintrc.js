module.exports = {
    "extends": "airbnb-base",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "env": {
        "browser": true,
        "es6": true
    },
    "rules": {
        "no-tabs": "off",
        "indent": [ "error", "tab" ],
        "arrow-parens": [ "error", "always" ],
        "func-names": [ "warn", "as-needed"],
        "new-cap": [ "error", { "newIsCapExceptionPattern": "^options\.." } ],
        "no-console": [ "error", { allow: ["warn", "error"] } ],
        "no-underscore-dangle": [ "error", { "allowAfterThis": true } ],

        // Custom Elements Helpers specific
        "no-param-reassign": [ "error", { "props": true, "ignorePropertyModificationsFor": [ "customElement" ] } ],
        "class-methods-use-this": [ "error", { "exceptMethods": [
            // BaseController
            "resolve",
            // SmoothState
            "onBefore", "onStart", "onReady", "onAfter"
        ] } ]
    }
};