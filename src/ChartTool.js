import Chart from 'chart.js/auto';
import './chart.css';

export default class ChartTool {
	static get toolbox() {
		return {
			title: 'Chart',
			icon: `<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="5" width="3" height="9" rx="1" fill="currentColor"/><rect x="7" y="2" width="3" height="12" rx="1" fill="currentColor"/><rect x="13" y="7" width="3" height="7" rx="1" fill="currentColor"/></svg>`,
		};
	}

	static get isReadOnlySupported() {
		return true;
	}

	constructor({ data, api, readOnly }) {
		this.api = api;
		this.readOnly = readOnly;

		this.data = {
			type: data.type || 'bar',
			labels: data.labels || ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
			datasets: data.datasets || [
				{
					label: 'Dataset 1',
					data: [12, 19, 3, 5],
					backgroundColor: '#4A90E2',
				},
			],
			title: data.title || '',
		};

		this.wrapper = null;
		this.chart = null;
		this.CSS = {
			baseClass: 'chart-tool',
			wrapper: 'chart-tool',
			canvasWrapper: 'chart-tool__canvas-wrapper',
			settings: 'chart-tool__settings',
			field: 'chart-tool__field',
			label: 'chart-tool__label',
			input: 'chart-tool__input',
			textarea: 'chart-tool__textarea',
			colors: 'chart-tool__colors',
			color: 'chart-tool__color',
			colorSelected: 'chart-tool__color--selected',
			addButton: 'chart-tool__add-button',
			dataRow: 'chart-tool__data-row',
			removeButton: 'chart-tool__remove-button',
			datasetBox: 'chart-tool__dataset-box',
			datasetHeader: 'chart-tool__dataset-header',
		};

		this.colors = [
			'#4A90E2',
			'#50C878',
			'#FF6B6B',
			'#FFD93D',
			'#A29BFE',
			'#FD79A8',
			'#FDCB6E',
			'#00B894',
			'#6C5CE7',
			'#E17055',
			'#74B9FF',
			'#55EFC4',
		];
	}

	render() {
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.CSS.wrapper);

		// Canvas wrapper
		const canvasWrapper = document.createElement('div');
		canvasWrapper.classList.add(this.CSS.canvasWrapper);
		canvasWrapper.style.position = 'relative';

		const canvas = document.createElement('canvas');
		canvasWrapper.appendChild(canvas);

		// Add title click overlay (only in edit mode)
		if (!this.readOnly) {
			const titleOverlay = document.createElement('div');
			titleOverlay.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 60px;
				cursor: text;
				z-index: 10;
			`;
			titleOverlay.title = 'Click to edit title';
			titleOverlay.addEventListener('click', (e) => {
				e.preventDefault();
				this._editTitle();
			});
			canvasWrapper.appendChild(titleOverlay);
		}

		this.wrapper.appendChild(canvasWrapper);

		// Initialize chart
		this._createChart(canvas);

		// Settings panel (only in edit mode)
		if (!this.readOnly) {
			const settings = this._createSettings();
			this.wrapper.appendChild(settings);
		}

		return this.wrapper;
	}

	_createChart(canvas) {
		const chartData = {
			labels: this.data.labels,
			datasets: this.data.datasets.map((dataset) => ({
				...dataset,
				borderColor: dataset.backgroundColor,
				borderWidth: 2,
				tension: 0.4,
			})),
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: this.data.datasets.length > 1,
					position: 'top',
				},
				title: {
					display: !!this.data.title,
					text: this.data.title,
					font: {
						size: 16,
						weight: 'bold',
					},
				},
			},
		};

		// Type-specific options
		if (this.data.type === 'pie' || this.data.type === 'doughnut') {
			options.plugins.legend.display = true;
		}

		if (this.chart) {
			this.chart.destroy();
		}

		this.chart = new Chart(canvas, {
			type: this.data.type,
			data: chartData,
			options: options,
		});
	}

	_createSettings() {
		const settings = document.createElement('div');
		settings.classList.add(this.CSS.settings);

		// Labels field
		const labelsField = this._createField(
			'Labels (comma-separated)',
			'input',
			this.data.labels.join(', '),
			(value) => {
				this.data.labels = value
					.split(',')
					.map((l) => l.trim())
					.filter((l) => l);
				this._updateChart();
			},
		);
		settings.appendChild(labelsField);

		// Datasets container
		this.datasetsContainer = document.createElement('div');

		// Dataset editor
		this.data.datasets.forEach((dataset, index) => {
			const datasetSection = this._createDatasetEditor(dataset, index);
			this.datasetsContainer.appendChild(datasetSection);
		});

		settings.appendChild(this.datasetsContainer);

		// Add Dataset button
		const addButton = document.createElement('button');
		addButton.classList.add(this.CSS.addButton);
		addButton.textContent = '+ Add Dataset';
		addButton.addEventListener('click', () => {
			this._addDataset();
		});
		settings.appendChild(addButton);

		return settings;
	}

	_addDataset() {
		// Create new dataset with default values
		const newDataset = {
			label: `Dataset ${this.data.datasets.length + 1}`,
			data: new Array(this.data.labels.length).fill(0),
			backgroundColor:
				this.colors[this.data.datasets.length % this.colors.length],
		};

		this.data.datasets.push(newDataset);

		// Re-render datasets
		this._refreshDatasets();
		this._updateChart();
	}

	_removeDataset(index) {
		if (this.data.datasets.length > 1) {
			this.data.datasets.splice(index, 1);
			this._refreshDatasets();
			this._updateChart();
		}
	}

	_refreshDatasets() {
		// Clear existing datasets
		this.datasetsContainer.innerHTML = '';

		// Re-render all datasets
		this.data.datasets.forEach((dataset, index) => {
			const datasetSection = this._createDatasetEditor(dataset, index);
			this.datasetsContainer.appendChild(datasetSection);
		});
	}

	_createField(labelText, type, value, onChange) {
		const field = document.createElement('div');
		field.classList.add(this.CSS.field);

		const label = document.createElement('label');
		label.classList.add(this.CSS.label);
		label.textContent = labelText;
		field.appendChild(label);

		let input;
		if (type === 'textarea') {
			input = document.createElement('textarea');
			input.classList.add(this.CSS.textarea);
		} else {
			input = document.createElement('input');
			input.type = type;
			input.classList.add(this.CSS.input);
		}

		input.value = value;
		input.addEventListener('input', (e) => onChange(e.target.value));
		field.appendChild(input);

		return field;
	}

	_createDatasetEditor(dataset, index) {
		// Outer box container
		const box = document.createElement('div');
		box.classList.add(this.CSS.datasetBox);

		// Header with label and remove button
		const header = document.createElement('div');
		header.classList.add(this.CSS.datasetHeader);

		const label = document.createElement('div');
		label.classList.add(this.CSS.label);
		label.textContent = `Dataset ${index + 1}`;
		header.appendChild(label);

		// Remove button (only show if more than 1 dataset)
		if (this.data.datasets.length > 1) {
			const removeBtn = document.createElement('button');
			removeBtn.classList.add(this.CSS.removeButton);
			removeBtn.innerHTML = '×';
			removeBtn.title = 'Remove dataset';
			removeBtn.addEventListener('click', () => {
				this._removeDataset(index);
			});
			header.appendChild(removeBtn);
		}

		box.appendChild(header);

		// Dataset name with label
		const nameLabel = document.createElement('label');
		nameLabel.classList.add(this.CSS.label);
		nameLabel.textContent = 'Name';
		nameLabel.style.marginBottom = '4px';
		nameLabel.style.display = 'block';
		box.appendChild(nameLabel);

		const nameInput = document.createElement('input');
		nameInput.classList.add(this.CSS.input);
		nameInput.value = dataset.label || '';
		nameInput.placeholder = 'Enter dataset name';
		nameInput.style.marginBottom = '12px';
		nameInput.addEventListener('input', (e) => {
			dataset.label = e.target.value;
			this._updateChart();
		});
		box.appendChild(nameInput);

		// Data values with label
		const dataLabel = document.createElement('label');
		dataLabel.classList.add(this.CSS.label);
		dataLabel.textContent = 'Values';
		dataLabel.style.marginBottom = '4px';
		dataLabel.style.display = 'block';
		box.appendChild(dataLabel);

		const dataInput = document.createElement('input');
		dataInput.classList.add(this.CSS.input);
		dataInput.value = dataset.data.join(', ');
		dataInput.placeholder = 'Enter values separated by commas';
		dataInput.style.marginBottom = '16px';
		dataInput.addEventListener('input', (e) => {
			dataset.data = e.target.value
				.split(',')
				.map((v) => parseFloat(v.trim()))
				.filter((v) => !isNaN(v));
			this._updateChart();
		});
		box.appendChild(dataInput);

		// Color picker with cleaner spacing
		const colorLabel = document.createElement('div');
		colorLabel.classList.add(this.CSS.label);
		colorLabel.textContent = 'Color';
		colorLabel.style.marginBottom = '8px';
		colorLabel.style.display = 'block';
		box.appendChild(colorLabel);

		const colorGrid = document.createElement('div');
		colorGrid.classList.add(this.CSS.colors);

		this.colors.forEach((color) => {
			const colorBtn = document.createElement('button');
			colorBtn.classList.add(this.CSS.color);
			colorBtn.style.backgroundColor = color;

			if (dataset.backgroundColor === color) {
				colorBtn.classList.add(this.CSS.colorSelected);
			}

			colorBtn.addEventListener('click', () => {
				dataset.backgroundColor = color;
				this._updateChart();

				// Update selected state
				colorGrid.querySelectorAll(`.${this.CSS.color}`).forEach((btn) => {
					btn.classList.remove(this.CSS.colorSelected);
				});
				colorBtn.classList.add(this.CSS.colorSelected);
			});

			colorGrid.appendChild(colorBtn);
		});

		box.appendChild(colorGrid);

		return box;
	}

	_updateChart() {
		const canvas = this.wrapper.querySelector('canvas');
		this._createChart(canvas);
	}

	_editTitle() {
		// Create temporary input overlay
		const canvas = this.wrapper.querySelector('canvas');
		const canvasWrapper = canvas.parentElement;
		const rect = canvas.getBoundingClientRect();

		const input = document.createElement('input');
		input.type = 'text';
		input.value = this.data.title || '';
		input.placeholder = 'Enter chart title...';
		input.style.cssText = `
			position: absolute;
			top: 10px;
			left: 50%;
			transform: translateX(-50%);
			width: 60%;
			padding: 8px 12px;
			font-size: 16px;
			font-weight: bold;
			text-align: center;
			border: 2px solid #3f8ae0;
			border-radius: 4px;
			z-index: 1000;
			background: white;
		`;

		canvasWrapper.style.position = 'relative';
		canvasWrapper.appendChild(input);
		input.focus();
		input.select();

		const saveAndRemove = () => {
			this.data.title = input.value.trim();
			input.remove();
			this._updateChart();
		};

		input.addEventListener('blur', saveAndRemove);
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				saveAndRemove();
			} else if (e.key === 'Escape') {
				input.remove();
			}
		});
	}

	save() {
		return this.data;
	}

	renderSettings() {
		const wrapper = document.createElement('div');

		// Chart type tune menu
		this.api.ui.createTune({
			icon: `<svg width="17" height="15" viewBox="0 0 17 15"><path d="M1 1h15M1 7.5h15M1 14h15" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
			label: 'Chart Type',
			onActivate: () => {},
		});

		return wrapper;
	}

	static get tunes() {
		return [
			{
				name: 'bar',
				icon: `<svg width="17" height="15"><rect x="1" y="5" width="3" height="9" fill="currentColor"/><rect x="7" y="2" width="3" height="12" fill="currentColor"/><rect x="13" y="7" width="3" height="7" fill="currentColor"/></svg>`,
				title: 'Bar Chart',
			},
			{
				name: 'line',
				icon: `<svg width="17" height="15"><path d="M1 14L5 8L9 11L16 1" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
				title: 'Line Chart',
			},
			{
				name: 'pie',
				icon: `<svg width="17" height="15"><circle cx="8.5" cy="7.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 1V7.5L14 4.5" fill="currentColor"/></svg>`,
				title: 'Pie Chart',
			},
			{
				name: 'doughnut',
				icon: `<svg width="17" height="15"><circle cx="8.5" cy="7.5" r="6.5" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
				title: 'Doughnut Chart',
			},
			{
				name: 'radar',
				icon: `<svg width="17" height="15"><polygon points="8.5,1 15,5 13,12 4,12 2,5" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
				title: 'Radar Chart',
			},
			{
				name: 'polarArea',
				icon: `<svg width="17" height="15"><path d="M8.5 1L12 7.5L8.5 14L5 7.5Z" fill="currentColor" opacity="0.5"/></svg>`,
				title: 'Polar Area Chart',
			},
		];
	}

	renderSettings() {
		const wrapper = document.createElement('div');

		const items = ChartTool.tunes.map((tune) => ({
			icon: tune.icon,
			label: tune.title,
			isActive: this.data.type === tune.name,
			closeOnActivate: true,
			onActivate: () => {
				this.data.type = tune.name;
				this._updateChart();
			},
		}));

		return items;
	}
}
