import { Plugin } from 'obsidian';
import { MyPluginSettings, DEFAULT_SETTINGS } from './settings';
import { registerRubyCommand } from './commands/rubyCommand';
import { addEnableRubyToFrontmatter } from './utils/frontmatter';
import { clearNavBlurEffects, toggleNavBlur } from './utils/navBlur';


export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        registerRubyCommand(this);

        // 添加侧边栏按钮：启用 Ruby 注音属性
        this.addRibbonIcon('languages', '启用 Ruby 注音', async () => {
            await addEnableRubyToFrontmatter(this.app);
        });

        // 添加侧边栏按钮：模糊文件导航
        this.addRibbonIcon('eye-off', '模糊文件导航', () => {
            toggleNavBlur(this.app);
        });

        // 注册命令用于绑定快捷键
        this.addCommand({
            id: 'toggle-file-nav-blur',
            name: '切换文件导航模糊',
            callback: () => toggleNavBlur(this.app)
        });
    }

    onunload() {
        clearNavBlurEffects();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
