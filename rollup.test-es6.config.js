import paths from 'rollup-plugin-includepaths';
import resolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'tests/specs.js',
	format: 'cjs',
	plugins: [
		resolve(),
		paths({ paths: ['src'] })
	],
	dest: 'tests/specs.es6.js'
};