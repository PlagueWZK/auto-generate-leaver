// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function () {

    // 获取关键的DOM元素
    const form = document.getElementById('leave-form');
    const classPeriodsInput = document.getElementById('class');
    const errorLabel = document.getElementById('class-error');

    // 唯一的表单提交监听器
    form.addEventListener('submit', async function (event) {
        // 1. 阻止表单的默认提交行为
        event.preventDefault();

        // 2. 【核心修复】在执行任何操作之前，先进行验证
        const validationResult = validateClassPeriods(classPeriodsInput.value);

        // 3. 如果验证失败，则显示错误并立即停止执行
        if (!validationResult.isValid) {
            classPeriodsInput.setCustomValidity(validationResult.message);
            classPeriodsInput.reportValidity(); // 强制浏览器显示内置的错误提示
            errorLabel.textContent = validationResult.message; // 也在我们自己的标签里显示
            return; // 关键：终止函数，不执行后面的下载逻辑
        }

        // 4. 只有验证通过后，才会执行这里的下载代码
        try {
            // 异步获取模板文件的内容
            const response = await fetch('template.html');
            if (!response.ok) {
                alert('无法加载模板文件！');
                return; // 获取失败也应停止
            }
            let templateContent = await response.text();

            // 从表单中获取用户输入的值
            const name = document.getElementById('name').value;
            const id = document.getElementById('id').value;
            const reasonType = document.getElementById('reason').value;
            const description = document.getElementById('description').value;
            const destination = document.getElementById('destination').value;
            const startDate = document.getElementById('start').value;
            const classPeriods = document.getElementById('class').value;
            const approver = document.getElementById('teacher').value;

            // 使用获取到的值替换模板中的占位符
            const filledContent = templateContent
                .replace(/{{name}}/g, name)
                .replace(/{{id}}/g, id)
                .replace(/{{reason}}/g, reasonType)
                .replace(/{{description}}/g, description)
                .replace(/{{destination}}/g, destination)
                .replace(/{{start}}/g, startDate)
                .replace(/{{class}}/g, classPeriods)
                .replace(/{{teacher}}/g, approver);

            // 创建并触发下载
            downloadHtml(filledContent, `leaver-${id}.html`);

        } catch (error) {
            console.error('生成文件时出错:', error);
            alert('生成文件失败，请检查控制台获取更多信息。');
        }
    });

    // 当用户开始修改输入时，清除自定义错误，以便他们可以重新提交
    classPeriodsInput.addEventListener('input', function () {
        classPeriodsInput.setCustomValidity('');
        errorLabel.textContent = '';
    });
});


/**
 * 对节次输入进行完整的逻辑验证
 * @param {string} value - 输入框的值
 * @returns {{isValid: boolean, message: string}}
 */
function validateClassPeriods(value) {
    if (!value) {
        return {isValid: true, message: ''}; // 空值由 required 属性处理
    }

    const pairs = value.split(',').map(s => s.trim()).filter(s => s); // 更健壮地处理空格
    let lastEndPeriod = 0;

    for (const pair of pairs) {
        const numbers = pair.split('-');

        if (numbers.length !== 2) {
            return {isValid: false, message: `格式错误: "${pair}" 不是有效的 "开始-结束" 格式。`};
        }

        const start = parseInt(numbers[0], 10);
        const end = parseInt(numbers[1], 10);

        if (isNaN(start) || isNaN(end)) {
            return {isValid: false, message: `格式错误: "${pair}" 包含非数字字符。`};
        }
        if (start < 1 || start > 11 || end < 1 || end > 11) {
            return {isValid: false, message: `节次必须在 1-11 之间，但 "${pair}" 超出范围。`};
        }
        if (end !== start + 1) {
            return {isValid: false, message: `节次必须是连续的 (如 1-2)，但 "${pair}" 不是。`};
        }
        if (start <= lastEndPeriod) {
            return {isValid: false, message: `节次必须按从小到大的顺序排列，但 "${pair}" 破坏了顺序。`};
        }
        lastEndPeriod = end;
    }

    return {isValid: true, message: ''};
}

/**
 * 将文本内容作为HTML文件下载
 * @param {string} content - HTML文件内容
 * @param {string} filename - 下载时的文件名
 */
function downloadHtml(content, filename) {
    const blob = new Blob([content], {type: 'text/html;charset=utf-8'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
