import { App, Notice, TFile } from 'obsidian';

/**
 * 在当前活动文档的 frontmatter 中添加 enable_ruby: true
 */
export async function addEnableRubyToFrontmatter(app: App): Promise<void> {
    const activeFile = app.workspace.getActiveFile();
    
    if (!activeFile) {
        new Notice('没有活动的文档');
        return;
    }

    if (!(activeFile instanceof TFile) || !activeFile.extension || activeFile.extension !== 'md') {
        new Notice('当前文件不是 Markdown 文件');
        return;
    }

    try {
        // 读取文件内容
        const content = await app.vault.read(activeFile);
        
        // 解析 frontmatter
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*(\n|$)/;
        const match = content.match(frontmatterRegex);
        
        let newContent: string;
        
        if (match) {
            // 已有 frontmatter
            let frontmatter = match[1].trim();
            const body = content.substring(match[0].length);
            
            // 检查是否已有 enable_ruby
            if (frontmatter.includes('enable_ruby:')) {
                // 更新现有的 enable_ruby
                frontmatter = frontmatter.replace(
                    /enable_ruby:\s*(true|false|.*?)(\n|$)/g,
                    'enable_ruby: true$2'
                );
            } else {
                // 添加新的 enable_ruby
                if (frontmatter) {
                    frontmatter += `\nenable_ruby: true`;
                } else {
                    frontmatter = 'enable_ruby: true';
                }
            }
            
            newContent = `---\n${frontmatter}\n---\n${body}`;
        } else {
            // 没有 frontmatter，创建新的
            newContent = `---\nenable_ruby: true\n---\n${content}`;
        }
        
        // 保存文件
        await app.vault.modify(activeFile, newContent);
        new Notice('已添加 enable_ruby: true 到文档属性');
    } catch (error) {
        console.error('添加 frontmatter 时出错:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        new Notice('添加属性时出错: ' + errorMessage);
    }
}

