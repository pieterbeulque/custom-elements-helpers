import babel from 'rollup-plugin-babel';
import paths from 'rollup-plugin-includepaths';
import resolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'tests/specs.js',
	format: 'cjs',
	plugins: [
		resolve(),
		paths({ paths: ['src'] }),
		babel({ presets: ['es2015-rollup'] })
	],
	dest: 'tests/specs.babel.js'
};