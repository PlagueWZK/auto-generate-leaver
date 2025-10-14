// 监听表单的提交事件
document.getElementById('leave-form').addEventListener('submit', async function(event) {
    // 阻止表单的默认提交行为（即刷新页面）
    event.preventDefault();

    try {
        // 1. 异步获取模板文件的内容
        const response = await fetch('template.html');
        if (!response.ok) {
            alert('无法加载模板文件！')
        }
        let templateContent = await response.text();

        // 2. 从表单中获取用户输入的值
        const name = document.getElementById('name').value;
        const id = document.getElementById('id').value;
        const reasonType = document.getElementById('reason-type').value;
        const description = document.getElementById('description').value;
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('start-date').value;
        const classPeriods = document.getElementById('class-periods').value;
        const approver = document.getElementById('approver').value;

        // 3. 使用获取到的值替换模板中的占位符
        const filledContent = templateContent
            .replace(/{{name}}/g, name)
            .replace(/{{id}}/g, id)
            .replace(/{{reason}}/g, reasonType)
            .replace(/{{description}}/g, description)
            .replace(/{{destination}}/g, destination)
            .replace(/{{start}}/g, startDate)
            .replace(/{{class}}/g, classPeriods)
            .replace(/{{teacher}}/g, approver);

        // 4. 创建并触发下载
        downloadHtml(filledContent, `leaver-${id}.html`);

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

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {

    // 找到表单和节次输入框
    const form = document.getElementById('leave-form'); // 假设你的表单ID是 leave-form
    const classPeriodsInput = document.getElementById('class-periods');
    const errorLabel = document.getElementById('class-periods-error');

    if (form && classPeriodsInput) {
        form.addEventListener('submit', function(event) {
            // 在提交时执行最终验证
            const validationResult = validateClassPeriods(classPeriodsInput.value);

            if (!validationResult.isValid) {
                // 阻止表单提交
                event.preventDefault();

                // 使用浏览器内置的API显示错误提示
                classPeriodsInput.setCustomValidity(validationResult.message);
                classPeriodsInput.reportValidity();

                // 也在我们自己的小标签里显示错误
                errorLabel.textContent = validationResult.message;
            }
        });

        // 当用户开始修改输入时，清除自定义错误，以便他们可以重新提交
        classPeriodsInput.addEventListener('input', function() {
            classPeriodsInput.setCustomValidity('');
            errorLabel.textContent = '';
        });
    }

    /**
     * 对节次输入进行完整的逻辑验证
     * @param {string} value - 输入框的值
     * @returns {{isValid: boolean, message: string}}
     */
    function validateClassPeriods(value) {
        if (!value) {
            return { isValid: true, message: '' }; // 如果是空值，让 required 属性去处理
        }

        const pairs = value.split(', ');
        let lastEndPeriod = 0; // 用于检查递增关系

        for (const pair of pairs) {
            const numbers = pair.split('-');

            // 检查是不是 d-d 格式
            if (numbers.length !== 2) {
                return { isValid: false, message: `格式错误: "${pair}" 不是有效的节次对。` };
            }

            const start = parseInt(numbers[0], 10);
            const end = parseInt(numbers[1], 10);

            // 检查是否是有效数字
            if (isNaN(start) || isNaN(end)) {
                return { isValid: false, message: `格式错误: "${pair}" 包含非数字字符。` };
            }

            // 检查数字范围 (虽然正则已检查，但JS检查更可靠)
            if (start < 1 || start > 11 || end < 1 || end > 11) {
                return { isValid: false, message: `节次必须在 1-11 之间，但 "${pair}" 超出范围。` };
            }

            // 【核心验证1】检查节次是否连续 (相差为1)
            if (end !== start + 1) {
                return { isValid: false, message: `节次必须是连续的，例如 1-2，但 "${pair}" 不是。` };
            }

            // 【核心验证2】检查节次是否递增
            if (start <= lastEndPeriod) {
                return { isValid: false, message: `节次必须按从小到大的顺序排列，但 "${pair}" 破坏了顺序。` };
            }

            // 更新上一组的结束节次，用于下一次比较
            lastEndPeriod = end;
        }

        // 所有验证通过
        return { isValid: true, message: '' };
    }
});