import { App, Plugin, PluginSettingTab, TFile, TFolder, MarkdownView, FuzzySuggestModal, SettingDefinitionItem } from 'obsidian';

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

		window.setTimeout(async () => {
			const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeLeaf || activeLeaf.file?.path !== file.path) return;

			const viewState = activeLeaf.leaf.getViewState();
			if (!viewState || !viewState.state) return;

			if (isTarget) {
				// Target page -> Force Reading Mode
				if (viewState.state.mode !== 'preview') {
					await activeLeaf.leaf.setViewState({
						...viewState,
						state: { ...viewState.state, mode: 'preview' }
					});
				}
			} else {
				// Non-target page -> Ensure preferred mode (default Live Preview)
				const nonTargetMode = this.settings.nonTargetMode || 'live-preview';
				if (nonTargetMode === 'live-preview') {
					if (viewState.state.mode !== 'source' || viewState.state.source === true) {
						await activeLeaf.leaf.setViewState({
							...viewState,
							state: { ...viewState.state, mode: 'source', source: false }
						});
					}
				} else if (nonTargetMode === 'source') {
					if (viewState.state.mode !== 'source' || viewState.state.source !== true) {
						await activeLeaf.leaf.setViewState({
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

class PageSuggestModal extends FuzzySuggestModal<TFile> {
	private onChoose: (file: TFile) => void;

	constructor(app: App, onChoose: (file: TFile) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder('Type note name to select...');
	}

	getItems(): TFile[] {
		const files: TFile[] = [];
		const collectFiles = (folder: TFolder) => {
			for (const child of folder.children) {
				if (child instanceof TFile && child.extension === 'md') {
					files.push(child);
				} else if (child instanceof TFolder) {
					collectFiles(child);
				}
			}
		};
		collectFiles(this.app.vault.getRoot());
		return files;
	}

	getItemText(file: TFile): string {
		return file.path;
	}

	onChooseItem(file: TFile): void {
		this.onChoose(file);
	}
}

class AutoReadingSettingTab extends PluginSettingTab {
	plugin: AutoReadingModePlugin;

	constructor(app: App, plugin: AutoReadingModePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Default view mode for other notes',
				desc: 'Choose the default view mode for all other notes in your vault.',
				control: {
					type: 'dropdown',
					key: 'nonTargetMode',
					options: {
						'live-preview': 'Live preview (default)',
						'source': 'Source mode (raw markdown)',
						'none': 'Do not change (leave tab mode as-is)'
					}
				}
			},
			{
				type: 'list',
				heading: 'Target pages',
				emptyState: 'No specific reading view pages configured. All notes will open in your default live preview mode.',
				addItem: {
					name: 'Add page',
					action: () => {
						new PageSuggestModal(this.app, async (selectedFile) => {
							if (!this.plugin.settings.targetPages.includes(selectedFile.path)) {
								this.plugin.settings.targetPages.push(selectedFile.path);
								await this.plugin.saveSettings();
								this.update();
							}
						}).open();
					}
				},
				onDelete: async (idx: number) => {
					this.plugin.settings.targetPages.splice(idx, 1);
					await this.plugin.saveSettings();
					this.update();
				},
				onReorder: async (oldIndex: number, newIndex: number) => {
					const [moved] = this.plugin.settings.targetPages.splice(oldIndex, 1);
					this.plugin.settings.targetPages.splice(newIndex, 0, moved);
					await this.plugin.saveSettings();
				},
				items: this.plugin.settings.targetPages.map((path) => ({
					name: path,
					searchable: false
				}))
			}
		];
	}
}
