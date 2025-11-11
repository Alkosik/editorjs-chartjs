import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		open: true,
	},
	build: {
		lib: {
			entry: 'src/index.js',
			name: 'EditorJSChartJS',
			fileName: 'chart-tool',
			formats: ['es', 'umd'],
		},
		rollupOptions: {
			external: ['chart.js'],
			output: {
				globals: {
					'chart.js': 'Chart',
				},
			},
		},
	},
});
