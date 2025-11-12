import { Editor, MarkdownView, Plugin } from 'obsidian';
import { RubyInputModal } from '../ui/rubyModal';

export function registerRubyCommand(plugin: Plugin) {
    plugin.addCommand({
        id: 'add-japanese-ruby',
        name: 'Add Japanese ruby text',
        hotkeys: [
            {
                modifiers: ['Ctrl'],
                key: 'j'
            }
        ],
        editorCallback: (editor: Editor) => {
            const selectedText = editor.getSelection();
            if (!selectedText.trim()) {
                return;
            }

            new RubyInputModal(plugin.app, selectedText, (ruby: string) => {
                // 获取当前光标位置
                const selection = editor.getSelection();
                const formatted = `｜${selection}《${ruby}》`;
                
                // 直接替换，不添加额外换行
                editor.replaceSelection(formatted, '');
            }).open();
        }
    });
}