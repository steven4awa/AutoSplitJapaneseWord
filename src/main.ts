import { Plugin } from 'obsidian';
import { MyPluginSettings, DEFAULT_SETTINGS } from './settings';
import { registerRubyCommand } from './commands/rubyCommand';
import { addEnableRubyToFrontmatter } from './utils/frontmatter';


export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        registerRubyCommand(this);
        
        // 添加侧边栏按钮
        this.addRibbonIcon('lucide-book-open', '启用 Ruby 注音', async () => {
            await addEnableRubyToFrontmatter(this.app);
        });
    }

    onunload() {
        // cleanup
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
