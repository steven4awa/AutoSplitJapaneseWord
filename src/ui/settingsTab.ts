import { App, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from '../main';
import { applyBlurSettings, clearNavBlurEffects } from '../utils/navBlur';

export class MyPluginSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Auto Split Japanese Word 设置' });

        // 模糊功能开关
        new Setting(containerEl)
            .setName('启用模糊效果')
            .setDesc('是否启用导航区域的模糊效果')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.blurEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.blurEnabled = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        applyBlurSettings(this.app, this.plugin.settings);
                    } else {
                        clearNavBlurEffects();
                    }
                }));

        // 模糊强度滑块
        const blurIntensitySetting = new Setting(containerEl)
            .setName('模糊强度')
            .setDesc(`当前强度: ${this.plugin.settings.blurIntensity}px`)
            .addSlider(slider => slider
                .setLimits(0, 20, 1)
                .setValue(this.plugin.settings.blurIntensity)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.blurIntensity = value;
                    await this.plugin.saveSettings();
                    // 更新描述显示当前值
                    blurIntensitySetting.setDesc(`当前强度: ${value}px`);
                    // 如果模糊已启用，立即应用新强度
                    if (this.plugin.settings.blurEnabled) {
                        applyBlurSettings(this.app, this.plugin.settings);
                    }
                }));
    }
}

