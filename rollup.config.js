import babel from 'rollup-plugin-babel';

export default {
	input: 'src/index.js',
	output: {
		file: 'lib/index.js',
		format: 'cjs',
	},
	plugins: [
		babel({
			presets: [
				['@babel/preset-env', {
					modules: false,
					targets: 'last 2 versions, > 0.5% in BE, not dead',
				}],
			],
		}),
	],
};
