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
				'.',
		)
	}

	return {
		presets: [
			isEnvTest && [
				require('@babel/preset-env').default,
				{
					targets: {
						node: 'current',
					},
				},
			],
			(isEnvProduction || isEnvDevelopment) && [
				// Latest stable ECMAScript features
				require('@babel/preset-env').default,
				{
					// Allow importing core-js in entrypoint and use browserlist to select polyfills
					useBuiltIns: 'entry',
					corejs: 3,
					// Do not transform modules to CJS by default
					modules: opts.modules || 'auto',
					targets: opts.targets,
					// Exclude transforms that make all code slower
					// https://github.com/facebook/create-react-app/pull/5278
					exclude: ['transform-typeof-symbol'],
				},
			],
			[
				require('@babel/preset-react').default,
				{
					// Runtime to use for JSX transforms
					runtime: opts.react && opts.react.runtime || "classic",
					// Adds component stack to warning messages
					// Adds __self attribute to JSX which React will use for some warnings
					development: isEnvDevelopment,
					// Will use the native built-in instead of trying to polyfill
					// behavior for any plugins that require one.
					useBuiltIns: true,
				},
			],
		].filter(Boolean),
		plugins: [
			[
				require('@babel/plugin-transform-runtime').default,
				{
					corejs: false,
				},
			],
			// Necessary to include regardless of the environment because
			// in practice some other transforms (such as object-rest-spread)
			// don't work without it: https://github.com/babel/babel/issues/7215
			[
				require('@babel/plugin-transform-destructuring').default,
				{
					// Use loose mode for performance:
					// https://github.com/facebook/create-react-app/issues/5602
					loose: false,
					selectiveLoose: [
						'useState',
						'useEffect',
						'useContext',
						'useReducer',
						'useCallback',
						'useMemo',
						'useRef',
						'useImperativeHandle',
						'useLayoutEffect',
						'useDebugValue',
					],
				},
			],
			// must be above class properties
			[
				require('@babel/plugin-proposal-decorators'), // stage 2
				{
					legacy: true,
				},
			],
			// Enable loose mode to use assignment instead of defineProperty
			// See discussion in https://github.com/facebook/create-react-app/issues/4263
			[
				require('@babel/plugin-proposal-class-properties').default,
				{
					loose: true,
				},
			],
			// The following two plugins use Object.assign directly, instead of Babel's
			// extends helper. Note that this assumes `Object.assign` is available.
			// { ...todo, completed: true }
			[
				require('@babel/plugin-proposal-object-rest-spread').default,
				{
					useBuiltIns: true,
				},
			],
			require('@babel/plugin-syntax-dynamic-import'), // stage 3
			require('@babel/plugin-syntax-import-meta'), // stage 3
			require('@babel/plugin-proposal-json-strings'), // stage 3
			require('@babel/plugin-proposal-function-sent'), // stage 2
			require('@babel/plugin-proposal-export-namespace-from'), // stage 2
			require('@babel/plugin-proposal-numeric-separator'), // stage 2
			require('@babel/plugin-proposal-throw-expressions'), // stage 2
			require('@babel/plugin-proposal-nullish-coalescing-operator'), // stage 3
			require('@babel/plugin-proposal-optional-chaining'), // stage 4
			isEnvProduction && [
				// Remove PropTypes from production build
				require('babel-plugin-transform-react-remove-prop-types').default,
				{
					removeImport: true,
				},
			],
			// required for plugin-transform-regenerator to handle for-of inside generators
			require('@babel/plugin-transform-for-of'),
			// function* () { yield 42; yield 43; }
			!isEnvTest && [
				require('@babel/plugin-transform-regenerator').default,
				{
					// Async functions are converted to generators by @babel/preset-env
					async: false,
				},
			],
			isEnvTest &&
				// Transform dynamic import to require
				require('babel-plugin-transform-dynamic-import').default,
		].filter(Boolean),
	}
}
