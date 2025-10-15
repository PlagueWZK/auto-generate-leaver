document.addEventListener('DOMContentLoaded', () => {

    // --- 元素获取 ---
    const imageContainer = document.getElementById('image-container');
    const qrCodeOverlay = document.getElementById('qr-code-overlay');
    const textOverlays = Array.from(document.querySelectorAll('.text-overlay'));

    // 内容输入框... (此处省略，与之前版本相同)
    const inputs = { name: document.getElementById('name-input'), studentId: document.getElementById('student-id-input'), type: document.getElementById('type-input'), leave: document.getElementById('leave-input'), reason: document.getElementById('reason-input'), description: document.getElementById('description-input'), destination: document.getElementById('destination-input'), start: document.getElementById('start-input'), end: document.getElementById('end-input'), class: document.getElementById('class-input'), state: document.getElementById('state-input'), teacher: document.getElementById('teacher-input'), };
    const overlays = { name: document.getElementById('name-overlay'), studentId: document.getElementById('student-id-overlay'), type: document.getElementById('type-overlay'), leave: document.getElementById('leave-overlay'), reason: document.getElementById('reason-overlay'), description: document.getElementById('description-overlay'), destination: document.getElementById('destination-overlay'), start: document.getElementById('start-overlay'), end: document.getElementById('end-overlay'), class: document.getElementById('class-overlay'), state: document.getElementById('state-overlay'), teacher: document.getElementById('teacher-overlay'), };

    // 样式和位置控制
    const leftPosInput = document.getElementById('left-pos-input');
    const topPosInput = document.getElementById('top-pos-input');
    const spacingInput = document.getElementById('spacing-input');
    const fontSizeInput = document.getElementById('font-size-input');
    const fontFamilySelect = document.getElementById('font-family-select');
    const qrCodeInput = document.getElementById('qr-code-input');
    const qrCodeSizeInput = document.getElementById('qr-code-size-input'); // 新增：获取尺寸输入框
    const imageSwitch = document.getElementById('image-switch');

    // 操作按钮... (此处省略)
    const saveBtn = document.getElementById('save-btn');
    const previewBtn = document.getElementById('preview-btn');

    // 预览模态框... (此处省略)
    const modal = document.getElementById('fullscreen-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.querySelector('.close-btn');

    // --- 功能函数 ---

    // 1. 更新文本内容... (无变化)
    function bindTextUpdates() { for (const key in inputs) { inputs[key].addEventListener('input', (e) => { overlays[key].textContent = e.target.value; }); } }

    // 2. 更新二维码 (有修改)
    const reader = new FileReader();
    reader.onload = (event) => {
        qrCodeOverlay.src = event.target.result;
        qrCodeOverlay.style.display = 'block'; // 显示二维码
        updateQrCodeSize(); // 应用初始尺寸
    };
    qrCodeInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            reader.readAsDataURL(file);
        }
    });

    // 3. 背景和透明度切换... (无变化)
    imageSwitch.addEventListener('change', (e) => {
        const isFinalVersion = e.target.checked;
        imageContainer.style.backgroundImage = isFinalVersion ? "url('whiteboard.png')" : "url('original.png')";
        qrCodeOverlay.style.opacity = isFinalVersion ? '1' : '0.5';
    });

    // 4. 更新所有文本的位置... (无变化)
    function updateTextPositions() { const left = leftPosInput.value; const topStart = parseInt(topPosInput.value, 10); const spacing = parseInt(spacingInput.value, 10); textOverlays.forEach((el, index) => { el.style.left = `${left}px`; el.style.top = `${topStart + (index * spacing)}px`; }); }

    // 5. 更新所有文本的字体样式... (无变化)
    function updateTextStyles() { const fontSize = fontSizeInput.value; const fontFamily = fontFamilySelect.value; textOverlays.forEach(el => { el.style.fontSize = `${fontSize}px`; el.style.fontFamily = fontFamily; }); }

    // 新增：更新二维码尺寸的函数
    function updateQrCodeSize() {
        const size = qrCodeSizeInput.value;
        if (size > 0) { // 简单验证
            qrCodeOverlay.style.width = `${size}px`;
            qrCodeOverlay.style.height = `${size}px`;
        }
    }

    // 6. 使元素可拖拽... (无变化)
    function makeDraggable(element) { let isDragging = false, offsetX, offsetY; element.addEventListener('mousedown', (e) => { e.preventDefault(); isDragging = true; const rect = element.getBoundingClientRect(); offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); }); function onMouseMove(e) { if (!isDragging) return; const containerRect = imageContainer.getBoundingClientRect(); let newLeft = e.clientX - containerRect.left - offsetX; let newTop = e.clientY - containerRect.top - offsetY; newLeft = Math.max(0, Math.min(newLeft, containerRect.width - element.offsetWidth)); newTop = Math.max(0, Math.min(newTop, containerRect.height - element.offsetHeight)); element.style.left = `${newLeft}px`; element.style.top = `${newTop}px`; } function onMouseUp() { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } }

    // 7. 全屏预览功能... (无变化)
    previewBtn.addEventListener('click', () => { modalContent.innerHTML = ''; const clone = imageContainer.cloneNode(true); const scaleX = window.innerWidth / clone.offsetWidth; const scaleY = window.innerHeight / clone.offsetHeight; const scale = Math.min(scaleX, scaleY) * 0.95; clone.style.transform = `scale(${scale})`; modalContent.appendChild(clone); modal.style.display = 'flex'; });
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.style.display = 'none'; } });

    // 8. 下载功能... (无变化)
    saveBtn.addEventListener('click', () => { html2canvas(imageContainer, { useCORS: true, backgroundColor: null }).then(canvas => { const link = document.createElement('a'); link.download = 'generated-image.png'; link.href = canvas.toDataURL('image/png'); link.click(); }); });

    // --- 初始化 ---
    function initialize() {
        bindTextUpdates();
        makeDraggable(qrCodeOverlay);

        // 绑定位置和样式控制事件
        leftPosInput.addEventListener('input', updateTextPositions);
        topPosInput.addEventListener('input', updateTextPositions);
        spacingInput.addEventListener('input', updateTextPositions);
        fontSizeInput.addEventListener('input', updateTextStyles);
        fontFamilySelect.addEventListener('change', updateTextStyles);
        qrCodeSizeInput.addEventListener('input', updateQrCodeSize); // 新增：绑定尺寸输入框事件

        // 触发一次以应用初始值
        updateTextPositions();
        updateTextStyles();
    }

    initialize();
});