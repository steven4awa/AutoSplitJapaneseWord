import { Plugin } from 'obsidian';
import { MyPluginSettings, DEFAULT_SETTINGS } from './settings';
import { registerRubyCommand } from './commands/rubyCommand';
import { addEnableRubyToFrontmatter } from './utils/frontmatter';
import { clearNavBlurEffects, toggleNavBlur, applyBlurSettings } from './utils/navBlur';
import { MyPluginSettingTab } from './ui/settingsTab';


export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        registerRubyCommand(this);

        // 添加设置标签页
        this.addSettingTab(new MyPluginSettingTab(this.app, this));

        // 添加侧边栏按钮：启用 Ruby 注音属性
        this.addRibbonIcon('languages', '启用 Ruby 注音', async () => {
            await addEnableRubyToFrontmatter(this.app);
        });

        // 添加侧边栏按钮：模糊文件导航
        this.addRibbonIcon('eye-off', '模糊文件导航', () => {
            // 切换模糊状态并保存
            this.settings.blurEnabled = !this.settings.blurEnabled;
            this.saveSettings();
            toggleNavBlur(this.app, this.settings);
        });

        // 注册命令用于绑定快捷键
        this.addCommand({
            id: 'toggle-file-nav-blur',
            name: '切换文件导航模糊',
            callback: () => {
                this.settings.blurEnabled = !this.settings.blurEnabled;
                this.saveSettings();
                toggleNavBlur(this.app, this.settings);
            }
        });

        // 应用保存的模糊设置
        this.applyBlurOnStartup();

        // 监听布局变化，自动应用模糊设置
        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                // 布局变化后延迟应用模糊，确保 DOM 已更新
                setTimeout(() => {
                    if (this.settings.blurEnabled) {
                        applyBlurSettings(this.app, this.settings);
                    }
                }, 100);
            })
        );
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

    /**
     * 启动时应用模糊设置
     * 使用重试机制确保 DOM 加载完成后应用模糊
     */
    private applyBlurOnStartup(): void {
        if (!this.settings.blurEnabled) {
            return;
        }

        // 立即尝试一次
        this.tryApplyBlur(0);
    }

    /**
     * 尝试应用模糊设置，如果失败则重试
     * @param attempt 当前尝试次数
     * @param maxAttempts 最大尝试次数
     * @param delay 重试延迟（毫秒）
     */
    private tryApplyBlur(attempt: number, maxAttempts: number = 15, delay: number = 300): void {
        // 检查是否存在基本的目标元素（使用更宽松的选择器，不依赖动态类）
        const hasBasicElements = document.querySelectorAll(
            '.nav-files-container, .view-content, .nav-folder-children'
        ).length > 0;
        
        if (!hasBasicElements) {
            // 基本元素不存在，如果还有重试次数，则延迟后重试
            if (attempt < maxAttempts) {
                setTimeout(() => {
                    this.tryApplyBlur(attempt + 1, maxAttempts, delay);
                }, delay);
            }
            return;
        }
        
        // 基本元素存在，尝试应用模糊设置
        applyBlurSettings(this.app, this.settings);
        
        // 检查是否成功应用模糊（检查是否有元素被添加了模糊类）
        const hasBlurredElements = document.querySelectorAll('.auto-split-japanese-word__blurred').length > 0;
        
        if (hasBlurredElements) {
            // 应用成功，不需要重试
            return;
        }
        
        // 基本元素存在但还没有模糊，可能是某些类还没有应用，继续重试
        if (attempt < maxAttempts) {
            setTimeout(() => {
                this.tryApplyBlur(attempt + 1, maxAttempts, delay);
            }, delay);
        }
    }
}
