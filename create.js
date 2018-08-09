'use strict'

module.exports = function(api, opts, env) {
	if (!opts) {
		opts = {}
	}

	var isEnvDevelopment = env === 'development'
	var isEnvProduction = env === 'production'
	var isEnvTest = env === 'test'

	if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
		throw new Error(
			'Using `babel-preset-react-app` requires that you specify `NODE_ENV` or ' +
				'`BABEL_ENV` environment variables. Valid values are "development", ' +
				'"test", and "production". Instead, received: ' +
				JSON.stringify(env) +
				'.'
		)
	}

	return {
		presets: [
			isEnvTest && [
				require('@babel/preset-env').default,
				{
					targets: {
						node: 'current'
					}
				}
			],
			(isEnvProduction || isEnvDevelopment) && [
				// Latest stable ECMAScript features
				require('@babel/preset-env').default,
				{
					// `entry` transforms `@babel/polyfill` into individual requires for
					// the targeted browsers. This is safer than `usage` which performs
					// static code analysis to determine what's required.
					// This is probably a fine default to help trim down bundles when
					// end-users inevitably import '@babel/polyfill'.
					useBuiltIns: 'entry',
					// Do not transform modules to CJS by defaylt
					modules: opts.modules || false,
					// enable "loose" option for bundled plugins
					// https://github.com/babel/babel/issues/8401#issuecomment-408918614
					// https://babeljs.io/docs/en/next/v7-migration#spec-compliancy
					loose: true,
					targets: opts.targets
				}
			],
			[
				require('@babel/preset-react').default,
				{
					// Adds component stack to warning messages
					// Adds __self attribute to JSX which React will use for some warnings
					development: isEnvDevelopment,
					// Will use the native built-in instead of trying to polyfill
					// behavior for any plugins that require one.
					useBuiltIns: true
				}
			]
		].filter(Boolean),
		plugins: [
			// Necessary to include regardless of the environment because
			// in practice some other transforms (such as object-rest-spread)
			// don't work without it: https://github.com/babel/babel/issues/7215
			require('@babel/plugin-transform-destructuring').default,
			// must be above class properties
			[
				require('@babel/plugin-proposal-decorators'), // stage 2
				{
					legacy: true
				}
			],
			// Enable loose mode to use assignment instead of defineProperty
			// See discussion in https://github.com/facebook/create-react-app/issues/4263
			[
				require('@babel/plugin-proposal-class-properties').default,
				{
					loose: true
				}
			],
			// The following two plugins use Object.assign directly, instead of Babel's
			// extends helper. Note that this assumes `Object.assign` is available.
			// { ...todo, completed: true }
			[
				require('@babel/plugin-proposal-object-rest-spread').default,
				{
					useBuiltIns: true
				}
			],
			// Polyfills the runtime needed for async/await and generators
			[
				require('@babel/plugin-transform-runtime').default,
				{
					helpers: false,
					regenerator: true
				}
			],
			require('@babel/plugin-syntax-dynamic-import'), // stage 3
			require('@babel/plugin-syntax-import-meta'), // stage 3
			require('@babel/plugin-proposal-json-strings'), // stage 3
			require('@babel/plugin-proposal-function-sent'), // stage 2
			require('@babel/plugin-proposal-export-namespace-from'), // stage 2
			require('@babel/plugin-proposal-numeric-separator'), // stage 2
			require('@babel/plugin-proposal-throw-expressions'), // stage 2
			// require('@babel/plugin-transform-react-display-name'),
			isEnvProduction && [
				// Remove PropTypes from production build
				require('babel-plugin-transform-react-remove-prop-types').default,
				{
					removeImport: true
				}
			],
			// required for plugin-transform-regenerator to handle for-of inside generators
			require('@babel/plugin-transform-for-of'),
			// function* () { yield 42; yield 43; }
			!isEnvTest && [
				require('@babel/plugin-transform-regenerator').default,
				{
					// Async functions are converted to generators by @babel/preset-env
					async: false
				}
			],
			isEnvTest &&
				// Transform dynamic import to require
				require('babel-plugin-transform-dynamic-import').default,
			isEnvTest &&
				// Support require.context in tests
				// You still need to setup the hook when running tests with
				//
				//   const registerRequireContextHook = require('babel-plugin-require-context-hook/register')
				//   registerRequireContextHook()
				//
				require('babel-plugin-require-context-hook').default
		].filter(Boolean)
	}
}
