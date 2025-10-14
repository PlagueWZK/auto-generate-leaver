// 监听表单的提交事件
document.getElementById('leave-form').addEventListener('submit', async function(event) {
    // 阻止表单的默认提交行为（即刷新页面）
    event.preventDefault();

    try {
        // 1. 异步获取模板文件的内容
        const response = await fetch('template.html');
        if (!response.ok) {
            throw new Error('无法加载模板文件！');
        }
        let templateContent = await response.text();

        // 2. 从表单中获取用户输入的值
        const name = document.getElementById('name').value;
        const reasonType = document.getElementById('reason-type').value;
        const description = document.getElementById('description').value;
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('start-date').value;
        const classPeriods = document.getElementById('class-periods').value;
        const approver = document.getElementById('approver').value;
        const currentDate = new Date().toLocaleDateString('zh-CN');

        // 3. 使用获取到的值替换模板中的占位符
        const filledContent = templateContent
            .replace(/{{name}}/g, name)
            .replace(/{{reason}}/g, reasonType)
            .replace(/{{description}}/g, description)
            .replace(/{{destination}}/g, destination)
            .replace(/{{start}}/g, startDate)
            .replace(/{{class}}/g, classPeriods)
            .replace(/{{teacher}}/g, approver);
            //.replace(/{{CURRENT_DATE}}/g, currentDate);

        // 4. 创建并触发下载
        downloadHtml(filledContent, `请假条-${name}.html`);

    } catch (error) {
        console.error('生成文件时出错:', error);
        alert('生成文件失败，请检查控制台获取更多信息。');
    }
});

/**
 * 将文本内容作为HTML文件下载
 * @param {string} content - HTML文件内容
 * @param {string} filename - 下载时的文件名
 */
function downloadHtml(content, filename) {
    // 创建一个 Blob 对象，类型为 HTML
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });

    // 创建一个隐藏的 <a> 标签
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // 将 <a> 标签添加到页面中，并模拟点击
    document.body.appendChild(link);
    link.click();

    // 完成后从页面中移除 <a> 标签并释放 URL 对象
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}