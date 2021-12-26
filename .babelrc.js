export default { // uncomment for MJS

    "presets": [
        [
            "@babel/preset-env",
            {
                // https://babeljs.io/docs/en/babel-preset-env.html#modules
                "modules": true,
                // https://babeljs.io/docs/en/babel-preset-env.html#usebuiltins
                "useBuiltIns": "usage",
                // https://babeljs.io/docs/en/babel-preset-env.html#corejs
                // https://github.com/zloirock/core-js#babelpreset-env
                //"corejs": '3.8',
                // https://babeljs.io/docs/en/babel-preset-env.html#forcealltransforms
                "forceAllTransforms": false,
                // https://babeljs.io/docs/en/babel-preset-env.html#ignorebrowserslistconfig
                "ignoreBrowserslistConfig": false,
                // https://babeljs.io/docs/en/babel-preset-env.html#debug
                "debug": true
            }
        ]
    ]
}
