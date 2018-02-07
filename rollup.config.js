import babel from 'rollup-plugin-babel';

export default {
	input: 'src/index.js',
	output: {
		file: 'lib/index.js',
		format: 'cjs',
	},
	plugins: [
		babel({
			plugins: ['external-helpers'],
			presets: [
				['env', {
					modules: false,
					browsers: [
						'last 2 versions',
						'> 0.5% in BE',
					],
				}],
			],
		}),
	],
};
