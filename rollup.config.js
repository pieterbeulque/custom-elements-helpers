import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/index.js',
	format: 'cjs',
	plugins: [
		babel({
			presets: ["es2015-rollup"]
		})
	],
	dest: 'lib/index.js'
};