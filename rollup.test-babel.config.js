import babel from 'rollup-plugin-babel';

export default {
	entry: 'tests/attributes-media.js',
	format: 'cjs',
	plugins: [
		babel({
			presets: ["es2015-rollup"]
		})
	],
	dest: 'tests/babel.js'
};