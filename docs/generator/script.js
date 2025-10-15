document.addEventListener('DOMContentLoaded', () => {

    // --- 元素获取 ---
    const imageContainer = document.getElementById('image-container');
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

    // 新增：单选和多选框组
    const reasonRadioGroup = document.getElementById('reason-radio-group');
    const classCheckboxGroup = document.getElementById('class-checkbox-group');

    // 样式和位置控制
    const leftPosInput = document.getElementById('left-pos-input');
    const fontSizeInput = document.getElementById('font-size-input');
    const fontFamilySelect = document.getElementById('font-family-select');
    const qrCodeInput = document.getElementById('qr-code-input');
    const qrCodeSizeInput = document.getElementById('qr-code-size-input');
    const qrCodeLeftInput = document.getElementById('qr-code-left-input'); // 新增
    const qrCodeTopInput = document.getElementById('qr-code-top-input');   // 新增
    const imageSwitch = document.getElementById('image-switch');
    const advancedPositionInputs = document.querySelectorAll('.advanced-settings input[type="number"]');

    // 操作按钮
    const saveBtn = document.getElementById('save-btn');
    const previewBtn = document.getElementById('preview-btn');

    // 预览模态框
    const modal = document.getElementById('fullscreen-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.querySelector('.close-btn');

    // --- 功能函数 ---

    // 1. 更新文本内容
    function bindTextUpdates() {
        for (const key in inputs) {
            inputs[key].addEventListener('input', (e) => {
                overlays[key].textContent = e.target.value;
            });
        }
    }

    // 2. 更新请假原因（单选）
    function updateReason() {
        const selectedReason = document.querySelector('input[name="reason"]:checked');
        if (selectedReason) {
            overlays.reason.textContent = selectedReason.value;
        }
    }

    // 3. 更新节次（多选）
    function updateClasses() {
        const selectedClasses = Array.from(classCheckboxGroup.querySelectorAll('input:checked'))
            .map(cb => cb.value);
        overlays.class.textContent = `[${selectedClasses.join(', ')}]`;
    }

    // 4. 更新二维码
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

    // 5. 背景和透明度切换
    imageSwitch.addEventListener('change', (e) => {
        const isFinalVersion = e.target.checked;
        imageContainer.style.backgroundImage = isFinalVersion ? "url('whiteboard.png')" : "url('original.png')";
        qrCodeOverlay.style.opacity = isFinalVersion ? '1' : '0.5';
    });

    // 6. 更新所有文本的水平位置
    function updateTextHorizontalPosition() {
        const left = leftPosInput.value;
        textOverlays.forEach((el) => {
            el.style.left = `${left}px`;
        });
    }

    // 7. 更新单个文本的垂直位置
    function updateTextVerticalPosition(inputElement) {
        const targetId = inputElement.dataset.target;
        const targetOverlay = document.getElementById(targetId);
        if (targetOverlay) {
            targetOverlay.style.top = `${inputElement.value}px`;
        }
    }

    // 8. 更新所有文本的字体样式
    function updateTextStyles() {
        const fontSize = fontSizeInput.value;
        const fontFamily = fontFamilySelect.value;
        textOverlays.forEach(el => {
            el.style.fontSize = `${fontSize}px`;
            el.style.fontFamily = fontFamily;
        });
    }

    // 9. 更新二维码尺寸
    function updateQrCodeSize() {
        const size = qrCodeSizeInput.value;
        if (size > 0) {
            qrCodeOverlay.style.width = `${size}px`;
            qrCodeOverlay.style.height = `${size}px`;
        }
    }

    // 10. 更新二维码位置
    function updateQrCodePosition() {
        qrCodeOverlay.style.left = `${qrCodeLeftInput.value}px`;
        qrCodeOverlay.style.top = `${qrCodeTopInput.value}px`;
    }

    // 11. 使元素可拖拽
    function makeDraggable(element) {
        let isDragging = false, offsetX, offsetY;
        element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            const rect = element.getBoundingClientRect();
            imageContainer.getBoundingClientRect();
// 鼠标点击位置相对于元素左上角的偏移
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isDragging) return;
            const containerRect = imageContainer.getBoundingClientRect();
            let newLeft = e.clientX - containerRect.left - offsetX;
            let newTop = e.clientY - containerRect.top - offsetY;

            // 限制在容器内
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - element.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - element.offsetHeight));

            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;

            // 同步更新输入框的值
            qrCodeLeftInput.value = Math.round(newLeft);
            qrCodeTopInput.value = Math.round(newTop);
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // 12. 全屏预览功能
    previewBtn.addEventListener('click', () => {
        modalContent.innerHTML = '';
        const clone = imageContainer.cloneNode(true);
        const scaleX = window.innerWidth / clone.offsetWidth;
        const scaleY = window.innerHeight / clone.offsetHeight;
        const scale = Math.min(scaleX, scaleY) * 0.95;
        clone.style.transform = `scale(${scale})`;
        clone.style.transformOrigin = 'center center'; // 居中缩放
        modalContent.appendChild(clone);
        modal.style.display = 'flex';
    });
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 13. 下载功能
    saveBtn.addEventListener('click', () => {
        html2canvas(imageContainer, {
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'generated-image.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    // --- 初始化 ---
    function initialize() {
        bindTextUpdates();
        makeDraggable(qrCodeOverlay);

        // 绑定单选和多选框事件
        reasonRadioGroup.addEventListener('change', updateReason);
        classCheckboxGroup.addEventListener('change', updateClasses);

        // 绑定位置和样式控制事件
        leftPosInput.addEventListener('input', updateTextHorizontalPosition);
        fontSizeInput.addEventListener('input', updateTextStyles);
        fontFamilySelect.addEventListener('change', updateTextStyles);
        qrCodeSizeInput.addEventListener('input', updateQrCodeSize);
        qrCodeLeftInput.addEventListener('input', updateQrCodePosition);
        qrCodeTopInput.addEventListener('input', updateQrCodePosition);

        // 绑定详细位置设置事件
        advancedPositionInputs.forEach(input => {
            input.addEventListener('input', () => updateTextVerticalPosition(input));
            // 初始化时应用一次默认值
            updateTextVerticalPosition(input);
        });

        // 触发一次以应用初始值
        updateTextHorizontalPosition();
        updateTextStyles();
        updateReason();
        updateClasses();
        updateQrCodePosition();
    }

    initialize();
});