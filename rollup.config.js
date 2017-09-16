import babel from 'rollup-plugin-babel';

export default {
	input: 'src/index.js',
	output: {
		file: 'lib/index.js',
		format: 'cjs',
	},
	plugins: [
		babel({
			presets: ['es2015-rollup'],
		}),
	],
};
