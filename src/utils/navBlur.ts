import { App, Notice } from 'obsidian';
import { MyPluginSettings } from '../settings';

const TARGET_SELECTORS = [
    '.nav-files-container.node-insert-event.show-unsupported',
    '.view-content.node-insert-event',
    '.nav-folder-children',
] as const;

const BLUR_CLASS = 'auto-split-japanese-word__blurred';
const STYLE_ID = 'auto-split-japanese-word__blur-style';
const HOVER_CLASS = 'auto-split-japanese-word__hover-unblur';

// 跟踪应该保持模糊状态的元素
const blurredElements = new Set<HTMLElement>();

// 存储事件监听器，以便清理
const eventListeners = new Map<HTMLElement, { mouseenter: () => void; mouseleave: () => void }>();

function ensureStyleElement(blurIntensity: number): void {
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement;
    if (!style) {
        style = document.createElement('style');
        style.id = STYLE_ID;
        document.head.appendChild(style);
    }

    style.textContent = `
.${BLUR_CLASS} {
    filter: blur(${blurIntensity}px);
    transition: filter 0.2s ease;
}
.${BLUR_CLASS}.${HOVER_CLASS} {
    filter: blur(0px);
}
`;
}

function addElementsFromSelector(result: Set<HTMLElement>, selector: string): void {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        result.add(el);
    });
}

function getTargetElements(): HTMLElement[] {
    const result = new Set<HTMLElement>();

    // 首先尝试使用严格的选择器（包含动态类）
    for (const selector of TARGET_SELECTORS) {
        addElementsFromSelector(result, selector);
    }

    // 如果找不到元素，尝试使用更宽松的选择器作为后备
    if (result.size === 0) {
        const fallbackSelectors = [
            '.nav-files-container',
            '.view-content',
            '.nav-folder-children',
        ];
        for (const selector of fallbackSelectors) {
            addElementsFromSelector(result, selector);
        }
    }

    return Array.from(result);
}

function addHoverListeners(element: HTMLElement): void {
    // 如果已经有监听器，先移除
    if (eventListeners.has(element)) {
        return;
    }

    const mouseenter = () => {
        if (blurredElements.has(element)) {
            element.classList.add(HOVER_CLASS);
        }
    };

    const mouseleave = () => {
        element.classList.remove(HOVER_CLASS);
    };

    element.addEventListener('mouseenter', mouseenter);
    element.addEventListener('mouseleave', mouseleave);

    eventListeners.set(element, { mouseenter, mouseleave });
}

function removeHoverListeners(element: HTMLElement): void {
    const listeners = eventListeners.get(element);
    if (listeners) {
        element.removeEventListener('mouseenter', listeners.mouseenter);
        element.removeEventListener('mouseleave', listeners.mouseleave);
        eventListeners.delete(element);
    }
}

export function toggleNavBlur(_app: App, settings?: MyPluginSettings): void {
    const targets = getTargetElements();
    if (targets.length === 0) {
        new Notice('未找到可模糊的目标区域');
        return;
    }

    const shouldBlur = !targets.every((el) => blurredElements.has(el));
    const blurIntensity = settings?.blurIntensity ?? 6;
    
    if (shouldBlur) {
        ensureStyleElement(blurIntensity);
        targets.forEach((el) => {
            blurredElements.add(el);
            el.classList.add(BLUR_CLASS);
            addHoverListeners(el);
        });
        new Notice('已模糊目标区域');
    } else {
        targets.forEach((el) => {
            blurredElements.delete(el);
            el.classList.remove(BLUR_CLASS);
            el.classList.remove(HOVER_CLASS);
            removeHoverListeners(el);
        });
        new Notice('已取消模糊目标区域');
    }
}

export function applyBlurSettings(app: App, settings: MyPluginSettings): void {
    const targets = getTargetElements();
    if (targets.length === 0) {
        return;
    }

    if (settings.blurEnabled) {
        ensureStyleElement(settings.blurIntensity);
        targets.forEach((el) => {
            blurredElements.add(el);
            el.classList.add(BLUR_CLASS);
            addHoverListeners(el);
        });
    } else {
        targets.forEach((el) => {
            blurredElements.delete(el);
            el.classList.remove(BLUR_CLASS);
            el.classList.remove(HOVER_CLASS);
            removeHoverListeners(el);
        });
    }
}

export function clearNavBlurEffects(): void {
    // 清理所有事件监听器
    blurredElements.forEach((el) => {
        removeHoverListeners(el);
        el.classList.remove(BLUR_CLASS);
        el.classList.remove(HOVER_CLASS);
    });
    blurredElements.clear();

    const style = document.getElementById(STYLE_ID);
    style?.remove();
}

