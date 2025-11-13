import { App, Notice } from 'obsidian';

const TARGET_SELECTORS = [
    '.nav-files-container.node-insert-event.show-unsupported',
    '.view-content.node-insert-event',
    '.nav-folder-children',
] as const;

const BLUR_CLASS = 'auto-split-japanese-word__blurred';
const STYLE_ID = 'auto-split-japanese-word__blur-style';

function ensureStyleElement(): void {
    if (document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.${BLUR_CLASS} {
    filter: blur(6px);
    transition: filter 0.2s ease;
}
`;
    document.head.appendChild(style);
}

function addElementsFromSelector(result: Set<HTMLElement>, selector: string): void {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        result.add(el);
    });
}

function getTargetElements(): HTMLElement[] {
    const result = new Set<HTMLElement>();

    for (const selector of TARGET_SELECTORS) {
        addElementsFromSelector(result, selector);
    }

    return Array.from(result);
}

export function toggleNavBlur(_app: App): void {
    const targets = getTargetElements();
    if (targets.length === 0) {
        new Notice('未找到可模糊的目标区域');
        return;
    }

    const shouldBlur = !targets.every((el) => el.classList.contains(BLUR_CLASS));
    if (shouldBlur) {
        ensureStyleElement();
        targets.forEach((el) => el.classList.add(BLUR_CLASS));
        new Notice('已模糊目标区域');
    } else {
        targets.forEach((el) => el.classList.remove(BLUR_CLASS));
        new Notice('已取消模糊目标区域');
    }
}

export function clearNavBlurEffects(): void {
    document.querySelectorAll<HTMLElement>(`.${BLUR_CLASS}`).forEach((el) => {
        el.classList.remove(BLUR_CLASS);
    });

    const style = document.getElementById(STYLE_ID);
    style?.remove();
}

