import { Plugin } from 'obsidian';
import { MyPluginSettings, DEFAULT_SETTINGS } from './settings';
import { registerRubyCommand } from './commands/rubyCommand';


export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        registerRubyCommand(this);
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
