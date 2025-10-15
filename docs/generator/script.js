document.addEventListener('DOMContentLoaded', () => {

    // --- 元素获取 ---
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
    // const fontFamilySelect = document.getElementById('font-family-select'); // <- 已删除
    const qrCodeInput = document.getElementById('qr-code-input');
    const qrCodeSizeInput = document.getElementById('qr-code-size-input');
    const qrCodeLeftInput = document.getElementById('qr-code-left-input');
    const qrCodeTopInput = document.getElementById('qr-code-top-input');
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
        // 修改 img 的 src 而不是 background-image
        backgroundImg.src = isFinalVersion ? "whiteboard.png" : "original.png";
        qrCodeOverlay.style.opacity = isFinalVersion ? '1' : '0.5';
    });

    // 省略部分无变化函数...
    function updateTextHorizontalPosition() { const left = leftPosInput.value; textOverlays.forEach((el) => { el.style.left = `${left}px`; }); }
    function updateTextVerticalPosition(inputElement) { const targetId = inputElement.dataset.target; const targetOverlay = document.getElementById(targetId); if (targetOverlay) { targetOverlay.style.top = `${inputElement.value}px`; } }

    // 【已修改】更新文本样式函数，不再处理字体
    function updateTextStyles() {
        const fontSize = fontSizeInput.value;
        textOverlays.forEach(el => {
            el.style.fontSize = `${fontSize}px`;
        });
    }

    function updateQrCodeSize() { const size = qrCodeSizeInput.value; if (size > 0) { qrCodeOverlay.style.width = `${size}px`; qrCodeOverlay.style.height = `${size}px`; } }
    function updateQrCodePosition() { qrCodeOverlay.style.left = `${qrCodeLeftInput.value}px`; qrCodeOverlay.style.top = `${qrCodeTopInput.value}px`; }
    function makeDraggable(element) { let isDragging = false, offsetX, offsetY; element.addEventListener('mousedown', (e) => { e.preventDefault(); isDragging = true; const rect = element.getBoundingClientRect(); offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); }); function onMouseMove(e) { if (!isDragging) return; const containerRect = imageContainer.getBoundingClientRect(); let newLeft = e.clientX - containerRect.left - offsetX; let newTop = e.clientY - containerRect.top - offsetY; newLeft = Math.max(0, Math.min(newLeft, containerRect.width - element.offsetWidth)); newTop = Math.max(0, Math.min(newTop, containerRect.height - element.offsetHeight)); element.style.left = `${newLeft}px`; element.style.top = `${newTop}px`; qrCodeLeftInput.value = Math.round(newLeft); qrCodeTopInput.value = Math.round(newTop); } function onMouseUp() { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } }


    // ---【核心修改】模态框与历史记录管理 ---

    // 显示模态框
    function showModal(content, state = 'modal', hash = '#modal') {
        modalContent.innerHTML = '';
        modalContent.appendChild(content);
        modal.style.display = 'flex';
        // 向浏览器历史添加一个状态，这样返回键会先关闭模态框
        history.pushState({ page: state }, '', hash);
    }

    // 关闭模态框
    function closeModal() {
        modal.style.display = 'none';
    }

    // 监听浏览器后退事件
    window.addEventListener('popstate', () => {
        closeModal();
    });

    // 为关闭按钮和背景点击添加返回操作
    closeModalBtn.addEventListener('click', () => history.back());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            history.back();
        }
    });

    // 12. 【已修改】全屏预览功能
    previewBtn.addEventListener('click', () => {
        const clone = imageContainer.cloneNode(true);
        const scaleX = window.innerWidth / clone.offsetWidth;
        const scaleY = window.innerHeight / clone.offsetHeight;
        const scale = Math.min(scaleX, scaleY) * 0.95;
        clone.style.transform = `scale(${scale})`;
        clone.style.transformOrigin = 'center center';
        showModal(clone, 'preview', '#preview');
    });

    // 13. 【已修改】下载功能 (适配移动端)
    saveBtn.addEventListener('click', () => {
        // 先显示一个加载提示
        const loadingMessage = document.createElement('p');
        loadingMessage.textContent = '正在生成图片...';
        loadingMessage.style.color = 'white';
        loadingMessage.style.fontSize = '20px';
        showModal(loadingMessage, 'save', '#save');

        html2canvas(imageContainer, {
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            const image = new Image();
            image.src = canvas.toDataURL('image/png');
            image.style.maxWidth = '90vw';
            image.style.maxHeight = '80vh';

            const instruction = document.createElement('p');
            instruction.textContent = '请长按上方图片保存';
            instruction.style.color = 'white';
            instruction.style.textAlign = 'center';
            instruction.style.marginTop = '15px';

            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.appendChild(image);
            container.appendChild(instruction);

            // 替换加载提示为最终图片
            showModal(container, 'save', '#save');
        });
    });

    // --- 初始化 ---
    function initialize() {
        // 如果页面加载时URL就有哈希，清理掉，防止刷新页面时模态框残留
        if (location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }

        bindTextUpdates();
        makeDraggable(qrCodeOverlay);

        reasonRadioGroup.addEventListener('change', updateReason);
        classCheckboxGroup.addEventListener('change', updateClasses);

        leftPosInput.addEventListener('input', updateTextHorizontalPosition);
        fontSizeInput.addEventListener('input', updateTextStyles);
        // fontFamilySelect.addEventListener('change', updateTextStyles); // <- 已删除
        qrCodeSizeInput.addEventListener('input', updateQrCodeSize);
        qrCodeLeftInput.addEventListener('input', updateQrCodePosition);
        qrCodeTopInput.addEventListener('input', updateQrCodePosition);

        advancedPositionInputs.forEach(input => {
            input.addEventListener('input', () => updateTextVerticalPosition(input));
            updateTextVerticalPosition(input);
        });

        updateTextHorizontalPosition();
        updateTextStyles();
        updateReason();
        updateClasses();
        updateQrCodePosition();
    }

    initialize();
});