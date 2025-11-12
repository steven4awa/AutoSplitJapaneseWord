import { App, Modal } from 'obsidian';

export class RubyInputModal extends Modal {
    selectedText: string;
    onSubmit: (ruby: string) => void;

    constructor(app: App, selectedText: string, onSubmit: (ruby: string) => void) {
        super(app);
        this.selectedText = selectedText;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        
        contentEl.createEl('h3', { text: `为 "${this.selectedText}" 添加注音` });
        
        const inputEl = contentEl.createEl('input', {
            type: 'text',
            placeholder: 'Enter ruby text (e.g., たい)'
        });
        inputEl.style.width = '100%';
        inputEl.style.padding = '8px';
        inputEl.style.marginBottom = '16px';
        inputEl.style.boxSizing = 'border-box';

        const handleSubmit = () => {
            const ruby = inputEl.value.trim();
            if (ruby) {
                this.onSubmit(ruby);
                this.close();
            }
        };

        inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSubmit();
            }
        });

        contentEl.createEl('button', { text: 'Confirm' }).addEventListener('click', handleSubmit);
        
        setTimeout(() => inputEl.focus(), 100);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}