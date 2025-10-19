
document.addEventListener('DOMContentLoaded', () => {
    // ==================== 图片生成器功能 ====================
    const imageContainer = document.getElementById('image-container');
    const backgroundImg = document.getElementById('background-img');
    const qrCodeOverlay = document.getElementById('qr-code-overlay');
    const textOverlays = Array.from(document.querySelectorAll('.text-overlay'));

    // 内容输入框
    const inputs = {
        name: document.getElementById('name-input'),
        studentId: document.getElementById('student-id-input'),
        type: document.getElementById('type-input'),
        leave: document.getElementById('leave-input'),
        description: document.getElementById('description-input'),
        destination: document.getElementById('destination-input'),
        start: document.getElementById('start-input'),
        end: document.getElementById('end-input'),
        state: document.getElementById('state-input'),
        teacher: document.getElementById('teacher-input'),
    };

    const overlays = {
        name: document.getElementById('name-overlay'),
        studentId: document.getElementById('student-id-overlay'),
        type: document.getElementById('type-overlay'),
        leave: document.getElementById('leave-overlay'),
        reason: document.getElementById('reason-overlay'),
        description: document.getElementById('description-overlay'),
        destination: document.getElementById('destination-overlay'),
        start: document.getElementById('start-overlay'),
        end: document.getElementById('end-overlay'),
        class: document.getElementById('class-overlay'),
        state: document.getElementById('state-overlay'),
        teacher: document.getElementById('teacher-overlay'),
    };

    const reasonRadioGroup = document.getElementById('reason-radio-group');
    const classCheckboxGroup = document.getElementById('class-checkbox-group');

    // 样式和位置控制
    const leftPosInput = document.getElementById('left-pos-input');
    const fontSizeInput = document.getElementById('font-size-input');
    const qrCodeInput = document.getElementById('qr-code-input');
    const qrCodeSizeInput = document.getElementById('qr-code-size-input');
    const qrCodeLeftInput = document.getElementById('qr-code-left-input');
    const qrCodeTopInput = document.getElementById('qr-code-top-input');
    const imageSwitch = document.getElementById('image-switch');
    const advancedPositionInputs = document.querySelectorAll('.advanced-settings input[type="number"]');

    // 详细设置中的快捷操作元素
    const offsetInput = document.getElementById('offset-input');
    const applyOffsetBtn = document.getElementById('apply-offset-btn');
    const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

    // 操作按钮
    const generatePreviewBtn = document.getElementById('generate-preview-btn');

    // 预览模态框
    const modal = document.getElementById('fullscreen-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.querySelector('.close-btn');

    // ==================== 图片生成器核心功能 ====================

    // 应用垂直位置整体偏移
    function applyVerticalOffset() {
        const offset = parseInt(offsetInput.value, 10);
        if (isNaN(offset)) return;

        advancedPositionInputs.forEach(input => {
            if (input.dataset.target) {
                const currentValue = parseInt(input.value, 10);
                if (!isNaN(currentValue)) {
                    input.value = currentValue + offset;
                    updateTextVerticalPosition(input);
                }
            }
        });
    }

    // 恢复所有垂直位置为默认值
    function resetVerticalPositions() {
        advancedPositionInputs.forEach(input => {
            if (input.dataset.target) {
                input.value = input.defaultValue;
                updateTextVerticalPosition(input);
            }
        });
    }

    // 绑定文本更新事件
    function bindTextUpdates() {
        for (const key in inputs) {
            inputs[key].addEventListener('input', (e) => {
                overlays[key].textContent = e.target.value;
            });
        }
    }

    // 更新请假原因
    function updateReason() {
        const selectedReason = document.querySelector('input[name="reason"]:checked');
        if (selectedReason) {
            overlays.reason.textContent = selectedReason.value;
        }
    }

    // 更新节次
    function updateClasses() {
        const selectedClasses = Array.from(classCheckboxGroup.querySelectorAll('input:checked'))
            .map(cb => cb.value);
        overlays.class.textContent = `[${selectedClasses.join(', ')}]`;
    }

    // 二维码上传处理
    const reader = new FileReader();
    reader.onload = (event) => {
        qrCodeOverlay.src = event.target.result;
        qrCodeOverlay.style.display = 'block';
        updateQrCodeSize();
        updateQrCodePosition();
    };
    qrCodeInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            reader.readAsDataURL(file);
        }
    });

    // 底图切换
    imageSwitch.addEventListener('change', (e) => {
        const isFinalVersion = e.target.checked;
        backgroundImg.src = isFinalVersion ? "whiteboard.png" : "original.png";
        qrCodeOverlay.style.opacity = isFinalVersion ? '1' : '0.5';
    });

    // 更新文本水平位置
    function updateTextHorizontalPosition() {
        const left = leftPosInput.value;
        textOverlays.forEach((el) => {
            el.style.left = `${left}px`;
        });
    }

    // 更新文本垂直位置
    function updateTextVerticalPosition(inputElement) {
        const targetId = inputElement.dataset.target;
        const targetOverlay = document.getElementById(targetId);
        if (targetOverlay) {
            targetOverlay.style.top = `${inputElement.value}px`;
        }
    }

    // 更新文本样式
    function updateTextStyles() {
        const fontSize = fontSizeInput.value;
        textOverlays.forEach(el => {
            el.style.fontSize = `${fontSize}px`;
        });
    }

    // 更新二维码大小
    function updateQrCodeSize() {
        const size = qrCodeSizeInput.value;
        if (size > 0) {
            qrCodeOverlay.style.width = `${size}px`;
            qrCodeOverlay.style.height = `${size}px`;
        }
    }

    // 更新二维码位置
    function updateQrCodePosition() {
        qrCodeOverlay.style.left = `${qrCodeLeftInput.value}px`;
        qrCodeOverlay.style.top = `${qrCodeTopInput.value}px`;
    }

    // 使元素可拖拽
    function makeDraggable(element) {
        let isDragging = false, offsetX, offsetY;

        element.addEventListener('mousedown', startDrag);
        element.addEventListener('touchstart', startDrag);

        function startDrag(e) {
            e.preventDefault();
            isDragging = true;

            const rect = element.getBoundingClientRect();
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;

            document.addEventListener('mousemove', onMove);
            document.addEventListener('touchmove', onMove);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
        }

        function onMove(e) {
            if (!isDragging) return;

            const containerRect = imageContainer.getBoundingClientRect();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            let newLeft = clientX - containerRect.left - offsetX;
            let newTop = clientY - containerRect.top - offsetY;

            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - element.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - element.offsetHeight));

            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;

            qrCodeLeftInput.value = Math.round(newLeft);
            qrCodeTopInput.value = Math.round(newTop);
        }

        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }
    }

    // 显示模态框
    function showModal(content, state = 'modal', hash = '#modal') {
        modalContent.innerHTML = '';
        modalContent.appendChild(content);
        modal.style.display = 'flex';
        history.pushState({ page: state }, '', hash);
    }

    // 关闭模态框
    function closeModal() {
        modal.style.display = 'none';
    }

    // 处理浏览器后退
    window.addEventListener('popstate', () => {
        closeModal();
    });

    closeModalBtn.addEventListener('click', () => history.back());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            history.back();
        }
    });

    // 生成预览按钮 - 合并了预览和保存功能
    generatePreviewBtn.addEventListener('click', () => {
        // 显示加载提示
        const loadingMessage = document.createElement('p');
        loadingMessage.textContent = '正在生成图片...';
        loadingMessage.className = 'loading';
        showModal(loadingMessage, 'generate', '#generate');

        // 使用 html2canvas 生成图片
        html2canvas(imageContainer, {
            useCORS: true,
            backgroundColor: null,
            scale: 2 // 提高图片质量
        }).then(canvas => {
            const image = new Image();
            image.src = canvas.toDataURL('image/png');
            image.style.maxWidth = '90vw';
            image.style.maxHeight = '80vh';
            image.style.objectFit = 'contain';

            // 添加保存提示
            const instruction = document.createElement('p');
            instruction.className = 'save-instruction';

            // 检测设备类型
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            instruction.textContent = isMobile ? '长按图片保存到相册' : '右键点击图片另存为';

            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.appendChild(image);
            container.appendChild(instruction);

            showModal(container, 'generate', '#generate');
        }).catch(error => {
            console.error('生成图片失败:', error);
            alert('生成图片失败,请重试');
            closeModal();
        });
    });

    // ==================== HTML生成器功能 ====================
    const downloadHtmlBtn = document.getElementById('download-html-btn');

    // HTML文件下载函数
    function downloadHtml(content, filename) {
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // 从图片生成器表单获取节次数据并格式化为HTML生成器需要的格式
    function getClassPeriodsFromForm() {
        const selectedClasses = Array.from(classCheckboxGroup.querySelectorAll('input:checked'))
            .map(cb => cb.value)
            .filter(v => v !== '早自习' && v !== '晚自习'); // 只保留数字格式的节次
        return selectedClasses.join(' '); // 使用空格分隔，不使用逗号
    }

    // 从开始时间提取日期部分 (YYYY-MM-DD HH:MM -> YYYY-MM-DD)
    function extractDate(dateTimeString) {
        return dateTimeString.split(' ')[0];
    }

    // 下载HTML按钮事件 - 使用图片生成器的表单数据
    downloadHtmlBtn.addEventListener('click', async () => {
        // 从图片生成器表单获取数据
        const name = inputs.name.value;
        const id = inputs.studentId.value;
        const reasonType = document.querySelector('input[name="reason"]:checked')?.value || '';
        const description = inputs.description.value;
        const destination = inputs.destination.value;
        const startDate = extractDate(inputs.start.value);
        const classPeriods = getClassPeriodsFromForm();
        const approver = inputs.teacher.value;

        // 验证必填字段
        if (!name || !id || !reasonType || !description || !destination || !startDate || !classPeriods || !approver) {
            alert('请填写所有必填字段(姓名、学号、请假原因、原因描述、目的地、开始时间、节次、审核人)');
            return;
        }

        try {
            // 加载模板
            const response = await fetch('template.html');
            if (!response.ok) {
                alert('无法加载模板文件!');
                return;
            }
            let templateContent = await response.text();

            // 替换占位符
            const filledContent = templateContent
                .replace(/{{name}}/g, name)
                .replace(/{{id}}/g, id)
                .replace(/{{reason}}/g, reasonType)
                .replace(/{{description}}/g, description)
                .replace(/{{destination}}/g, destination)
                .replace(/{{start}}/g, startDate)
                .replace(/{{class}}/g, classPeriods)
                .replace(/{{teacher}}/g, approver);

            // 下载文件
            downloadHtml(filledContent, `leaver-${id}.html`);

            alert('HTML请假条生成成功!');
        } catch (error) {
            console.error('生成文件时出错:', error);
            alert('生成文件失败,请检查控制台获取更多信息。');
        }
    });

    // ==================== 初始化 ====================
    function initialize() {
        // 清除URL hash
        if (location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }

        // 图片生成器初始化
        bindTextUpdates();
        makeDraggable(qrCodeOverlay);

        reasonRadioGroup.addEventListener('change', updateReason);
        classCheckboxGroup.addEventListener('change', updateClasses);

        leftPosInput.addEventListener('input', updateTextHorizontalPosition);
        fontSizeInput.addEventListener('input', updateTextStyles);
        qrCodeSizeInput.addEventListener('input', updateQrCodeSize);
        qrCodeLeftInput.addEventListener('input', updateQrCodePosition);
        qrCodeTopInput.addEventListener('input', updateQrCodePosition);

        advancedPositionInputs.forEach(input => {
            input.addEventListener('input', () => updateTextVerticalPosition(input));
            updateTextVerticalPosition(input);
        });

        applyOffsetBtn.addEventListener('click', applyVerticalOffset);
        resetDefaultsBtn.addEventListener('click', resetVerticalPositions);

        updateTextHorizontalPosition();
        updateTextStyles();
        updateReason();
        updateClasses();
        updateQrCodePosition();
    }

    initialize();
});
