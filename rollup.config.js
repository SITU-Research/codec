import svelte from 'rollup-plugin-svelte-hot';
import hmr from 'rollup-plugin-hot';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import autoPreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';

import replace from '@rollup/plugin-replace';

const production = !process.env.ROLLUP_WATCH;
const hot = !production

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		replace({
			GOOGLE_SERVICE_ACCOUNT_EMAIL: JSON.stringify(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
			GOOGLE_CLIENT_PRIVATE_KEY: JSON.stringify(process.env.GOOGLE_CLIENT_PRIVATE_KEY),
			GOOGLE_SHEET_ID: JSON.stringify(process.env.GOOGLE_SHEET_ID),
			MAPBOX_ACCESS_TOKEN: JSON.stringify(process.env.MAPBOX_ACCESS_TOKEN),
			preventAssignment: true
		}),

		svelte({
			dev: !production,
			preprocess: autoPreprocess(),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			},
			...(!hot && {
				css: css => {
					css.write('public/bundle.css')
				}
			}),
			hot: hot && {
				noReload: false,
				optimistic: true,
				preserveLocalState: true
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({ sourceMap: !production }),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

		hot && hmr ({
			public: 'public',
		})
	],
	watch: {
		clearScreen: false
	}
};
