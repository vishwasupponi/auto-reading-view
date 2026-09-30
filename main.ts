import { App, Plugin, PluginSettingTab, Setting, TFile, MarkdownView, AbstractInputSuggest, TextComponent } from 'obsidian';

interface AutoReadingSettings {
	targetPages: string[];
	nonTargetMode: 'live-preview' | 'source' | 'none';
}

const DEFAULT_SETTINGS: AutoReadingSettings = {
	targetPages: [],
	nonTargetMode: 'live-preview'
};

export default class AutoReadingModePlugin extends Plugin {
	settings: AutoReadingSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new AutoReadingSettingTab(this.app, this));

		// Handle file-open event
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => {
				if (file) {
					this.handleFileOpen(file);
				}
			})
		);

		// Handle active-leaf-change event
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf && leaf.view instanceof MarkdownView && leaf.view.file) {
					this.handleFileOpen(leaf.view.file);
				}
			})
		);

		// Handle layout ready
		this.app.workspace.onLayoutReady(() => {
			const file = this.app.workspace.getActiveFile();
			if (file) {
				this.handleFileOpen(file);
			}
		});
	}

	private isFileTarget(file: TFile): boolean {
		if (!this.settings || !Array.isArray(this.settings.targetPages) || this.settings.targetPages.length === 0) {
			return false;
		}

		const filePath = file.path.toLowerCase();
		const fileBasename = file.basename.toLowerCase();

		return this.settings.targetPages.some((target) => {
			let t = target.trim().toLowerCase();
			if (!t) return false;

			if (t.startsWith('/')) t = t.substring(1);
			if (t.endsWith('.md')) t = t.substring(0, t.length - 3);

			if (fileBasename === t) return true;

			const pathWithoutExt = filePath.endsWith('.md') ? filePath.substring(0, filePath.length - 3) : filePath;
			if (pathWithoutExt === t) return true;

			return false;
		});
	}

	private handleFileOpen(file: TFile) {
		if (!file || file.extension !== 'md') return;

		const isTarget = this.isFileTarget(file);

		window.setTimeout(() => {
			const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeLeaf || activeLeaf.file?.path !== file.path) return;

			const viewState = activeLeaf.leaf.getViewState();
			if (!viewState || !viewState.state) return;

			if (isTarget) {
				// Target page -> Force Reading Mode
				if (viewState.state.mode !== 'preview') {
					activeLeaf.leaf.setViewState({
						...viewState,
						state: { ...viewState.state, mode: 'preview' }
					});
				}
			} else {
				// Non-target page -> Ensure preferred mode (default Live Preview)
				const nonTargetMode = this.settings.nonTargetMode || 'live-preview';
				if (nonTargetMode === 'live-preview') {
					if (viewState.state.mode !== 'source' || viewState.state.source === true) {
						activeLeaf.leaf.setViewState({
							...viewState,
							state: { ...viewState.state, mode: 'source', source: false }
						});
					}
				} else if (nonTargetMode === 'source') {
					if (viewState.state.mode !== 'source' || viewState.state.source !== true) {
						activeLeaf.leaf.setViewState({
							...viewState,
							state: { ...viewState.state, mode: 'source', source: true }
						});
					}
				}
			}
		}, 60);
	}

	async loadSettings() {
		const data = (await this.loadData()) as Partial<AutoReadingSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
		if (!Array.isArray(this.settings.targetPages)) {
			this.settings.targetPages = [];
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class FileSuggest extends AbstractInputSuggest<TFile> {
	private textComponent: TextComponent;

	constructor(app: App, textComponent: TextComponent) {
		super(app, textComponent.inputEl);
		this.textComponent = textComponent;
	}

	getSuggestions(query: string): TFile[] {
		const lower = query.toLowerCase().trim();
		const files = this.app.vault.getMarkdownFiles();
		if (!lower) return files.slice(0, 10);
		return files
			.filter(
				(file) =>
					file.path.toLowerCase().includes(lower) ||
					file.basename.toLowerCase().includes(lower)
			)
			.slice(0, 15);
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.path);
	}

	selectSuggestion(file: TFile): void {
		this.textComponent.setValue(file.path);
		this.textComponent.inputEl.dispatchEvent(new Event('input'));
		this.close();
	}
}

class AutoReadingSettingTab extends PluginSettingTab {
	plugin: AutoReadingModePlugin;

	constructor(app: App, plugin: AutoReadingModePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Auto Reading Mode Settings')
			.setHeading();

		// Non-target page mode setting
		new Setting(containerEl)
			.setName('Mode for Other (Non-Target) Pages')
			.setDesc('Choose the default view mode for all other notes in your vault:')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('live-preview', 'Live Preview (Default)')
					.addOption('source', 'Source Mode (Raw Markdown)')
					.addOption('none', 'Do Not Change (Leave Tab Mode As-Is)')
					.setValue(this.plugin.settings.nonTargetMode || 'live-preview')
					.onChange(async (value: 'live-preview' | 'source' | 'none') => {
						this.plugin.settings.nonTargetMode = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Target Reading Mode Pages')
			.setHeading();

		let inputComponent: TextComponent;

		new Setting(containerEl)
			.setName('Add a Reading Mode Page')
			.setDesc('Type a note name or path from your vault to see autocompletion recommendations:')
			.addText((text) => {
				inputComponent = text;
				text.setPlaceholder('Start typing note name...');
				new FileSuggest(this.app, text);
			})
			.addButton((button) =>
				button
					.setButtonText('Add Page')
					.setCta()
					.onClick(async () => {
						const value = inputComponent.getValue().trim();
						if (value && !this.plugin.settings.targetPages.includes(value)) {
							this.plugin.settings.targetPages.push(value);
							await this.plugin.saveSettings();
							this.display();
						}
					})
			);

		new Setting(containerEl)
			.setName('Configured Reading Mode Pages')
			.setHeading();

		if (this.plugin.settings.targetPages.length === 0) {
			containerEl.createEl('p', {
				text: 'No specific Reading Mode pages configured. All notes will open in your default Live Preview mode.',
				cls: 'setting-item-description'
			});
			return;
		}

		for (let i = 0; i < this.plugin.settings.targetPages.length; i++) {
			const pagePath = this.plugin.settings.targetPages[i];
			new Setting(containerEl)
				.setName(pagePath)
				.addButton((button) =>
					button
						.setButtonText('Remove')
						.setDestructive()
						.onClick(async () => {
							this.plugin.settings.targetPages.splice(i, 1);
							await this.plugin.saveSettings();
							this.display();
						})
				);
		}
	}
}
