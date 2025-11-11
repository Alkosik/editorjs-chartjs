# Editor.js Chart Tool

A Chart.js integration plugin for Editor.js that allows you to create charts right in the editor.

## Features

-   **6 Chart Types**: Bar, Line, Pie, Doughnut, Radar, and Polar Area charts
-   **Tune Menu Integration**: Chart type switching using Editor.js built-in tune menu
-   **Full Editability**: Edit labels, data values, titles, and colors in real-time
-   **Color Picker**: Choose from 12 preset colors for your charts
-   **Multiple Datasets**: Support for multiple data sets
-   **Responsive**: Charts automatically adjust to container size

## Installation

```bash
npm install editorjs-chartjs chart.js
```

## Usage

### Basic Setup

```javascript
import EditorJS from '@editorjs/editorjs';
import ChartTool from 'editorjs-chartjs';

const editor = new EditorJS({
	holder: 'editorjs',
	tools: {
		chart: {
			class: ChartTool,
		},
	},
});
```

### With Initial Data

```javascript
const editor = new EditorJS({
	holder: 'editorjs',
	tools: {
		chart: ChartTool,
	},
	data: {
		blocks: [
			{
				type: 'chart',
				data: {
					type: 'bar',
					title: 'Monthly Revenue',
					labels: ['Jan', 'Feb', 'Mar', 'Apr'],
					datasets: [
						{
							label: 'Sales',
							data: [12000, 19000, 15000, 25000],
							backgroundColor: '#4A90E2',
						},
					],
				},
			},
		],
	},
});
```

## Development

### Setup

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

This will start a Vite dev server at `http://localhost:5173` with a live demo of the chart tool.

### Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Data Structure

The plugin saves data in the following format:

```javascript
{
  type: 'bar',           // Chart type
  title: 'Chart Title',  // Optional chart title
  labels: ['A', 'B'],    // X-axis labels
  datasets: [
    {
      label: 'Dataset 1',        // Dataset name
      data: [10, 20],            // Values
      backgroundColor: '#4A90E2' // Color
    }
  ]
}
```

## Customization

### Available Colors

The plugin comes with 12 preset colors:

-   Blue (#4A90E2)
-   Green (#50C878)
-   Red (#FF6B6B)
-   Yellow (#FFD93D)
-   Purple (#A29BFE)
-   Pink (#FD79A8)
-   Orange (#FDCB6E)
-   Teal (#00B894)
-   Indigo (#6C5CE7)
-   Coral (#E17055)
-   Sky Blue (#74B9FF)
-   Mint (#55EFC4)

### Styling

You can customize the appearance by overriding the CSS classes:

```css
.chart-tool {
	/* Main wrapper */
}

.chart-tool__canvas-wrapper {
	/* Chart canvas container */
}

.chart-tool__settings {
	/* Settings panel */
}
```

## Credits

Built with:

-   [Editor.js](https://editorjs.io/)
-   [Chart.js](https://www.chartjs.org/)
-   [Vite](https://vitejs.dev/)

---
