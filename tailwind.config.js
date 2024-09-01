import flowbitePlugin from 'flowbite/plugin';
import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],

	theme: {
		extend: {
			screens: {
				xs: '480px',
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px'
			},
			colors: {
				primary: '#628da8',
				secondary: '#a2c4d9',
				accent: '#67a9d4',
				background: '#fafbfb',
				text: '#0b0b0b'
			},
			fontFamily: {
				sans: ['Inter', ...fontFamily.sans],
				orbitron: ['Orbitron', ...fontFamily.sans]
			}
		}
	},

	plugins: [flowbitePlugin]
};
