module.exports = {
	env: {
		es6: true,
		node: true,
	},
	extends: ['airbnb-base', 'prettier'],
	plugins: ['prettier'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'no-restricted-globals': ['error', 'event', 'fdescribe'],
		'no-console': 'off',
		'prettier/prettier': 'error',
		'class-methods-use-this': 'off',
		'no-param-reassign': 'off',
		camelcase: 'off',
		'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
	},
};
