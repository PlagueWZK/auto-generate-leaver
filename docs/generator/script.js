document.addEventListener('DOMContentLoaded', () => {

    // 获取DOM元素
    const nameInput = document.getElementById('name-input');
    const studentIdInput = document.getElementById('student-id-input');
    const typeInput = document.getElementById('type-input');
    const leaveInput = document.getElementById('leave-input');
    const reasonInput = document.getElementById('reason-input');
    const descriptionInput = document.getElementById('description-input');
    const destinationInput = document.getElementById('destination-input');
    const startInput = document.getElementById('start-input');
    const endInput = document.getElementById('end-input');
    const classInput = document.getElementById('class-input');
    const stateInput = document.getElementById('state-input');
    const teacherInput = document.getElementById('teacher-input');
    const qrCodeInput = document.getElementById('qr-code-input');
    const saveBtn = document.getElementById('save-btn');
    const imageSwitch = document.getElementById('image-switch'); // 新增：获取开关元素

    const nameOverlay = document.getElementById('name-overlay');
    const studentIdOverlay = document.getElementById('student-id-overlay');
    const typeOverlay = document.getElementById('type-overlay');
    const leaveOverlay = document.getElementById('leave-overlay');
    const reasonOverlay = document.getElementById('reason-overlay');
    const descriptionOverlay = document.getElementById('description-overlay');
    const destinationOverlay = document.getElementById('destination-overlay');
    const startOverlay = document.getElementById('start-overlay');
    const endOverlay = document.getElementById('end-overlay');
    const classOverlay = document.getElementById('class-overlay');
    const stateOverlay = document.getElementById('state-overlay');
    const teacherOverlay = document.getElementById('teacher-overlay');
    const qrCodeOverlay = document.getElementById('qr-code-overlay');
    const imageContainer = document.getElementById('image-container');

    // --- 1. 动态更新文本内容 ---
    nameInput.addEventListener('input', (e) => { nameOverlay.textContent = e.target.value; });
    studentIdInput.addEventListener('input', (e) => { studentIdOverlay.textContent = e.target.value; });
    typeInput.addEventListener('input', (e) => { typeOverlay.textContent = e.target.value; }); // 修复：目标是 typeOverlay
    leaveInput.addEventListener('input', (e) => { leaveOverlay.textContent = e.target.value; });
    reasonInput.addEventListener('input', (e) => { reasonOverlay.textContent = e.target.value; });
    descriptionInput.addEventListener('input', (e) => { descriptionOverlay.textContent = e.target.value; });
    destinationInput.addEventListener('input', (e) => { destinationOverlay.textContent = e.target.value; });
    startInput.addEventListener('input', (e) => { startOverlay.textContent = e.target.value; });
    endInput.addEventListener('input', (e) => { endOverlay.textContent = e.target.value; });
    classInput.addEventListener('input', (e) => { classOverlay.textContent = e.target.value; });
    stateInput.addEventListener('input', (e) => { stateOverlay.textContent = e.target.value; });
    teacherInput.addEventListener('input', (e) => { teacherOverlay.textContent = e.target.value; });

    // --- 2. 更新二维码图片 ---
    qrCodeInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                qrCodeOverlay.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 新增功能：背景切换 ---
    imageSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            // 切换到最终版本
            imageContainer.style.backgroundImage = "url('whiteboard.png')";
            qrCodeOverlay.style.opacity = '1';
        } else {
            // 切换回模板
            imageContainer.style.backgroundImage = "url('original.png')";
            qrCodeOverlay.style.opacity = '0.5';
        }
    });

    // --- 3. 实现拖拽功能 (Bug修复版) ---
    function makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            // 阻止默认行为，如图片被浏览器默认拖拽
            e.preventDefault();
            isDragging = true;

            // 计算鼠标点击位置相对于元素左上角的偏移量
            // 使用 getBoundingClientRect 来获取相对于视口的位置，可以正确处理页面滚动
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isDragging) return;

            // 获取父容器的位置信息
            const containerRect = imageContainer.getBoundingClientRect();

            // 计算元素新的 left 和 top 值
            // e.clientX/Y 是鼠标相对于视口的位置
            // containerRect.left/top 是容器相对于视口的位置
            // offsetX/Y 是鼠标在元素内的偏移
            let newLeft = e.clientX - containerRect.left - offsetX;
            let newTop = e.clientY - containerRect.top - offsetY;

            // 确保元素不会移出容器边界
            // 使用 offsetWidth/Height 获取元素的实际渲染尺寸
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - element.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - element.offsetHeight));

            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
        }

        function onMouseUp() {
            isDragging = false;
            // 拖动结束后移除监听器，避免不必要的性能消耗
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // 让所有需要拖拽的元素都拥有该功能
    makeDraggable(nameOverlay);
    makeDraggable(studentIdOverlay);
    makeDraggable(typeOverlay);
    makeDraggable(leaveOverlay);
    makeDraggable(reasonOverlay);
    makeDraggable(descriptionOverlay);
    makeDraggable(destinationOverlay);
    makeDraggable(startOverlay);
    makeDraggable(endOverlay);
    makeDraggable(classOverlay);
    makeDraggable(stateOverlay);
    makeDraggable(teacherOverlay);
    makeDraggable(qrCodeOverlay);


    // --- 4. 保存并下载图片 ---
    saveBtn.addEventListener('click', () => {
        // 使用 html2canvas 将 div 转换为 canvas
        html2canvas(imageContainer, {
            useCORS: true, // 如果图片跨域需要此选项
            // 确保背景图被正确绘制
            backgroundColor: null
        }).then(canvas => {
            // 创建一个 <a> 标签用于下载
            const link = document.createElement('a');
            link.download = 'generated-image.png'; // 下载文件的名称
            link.href = canvas.toDataURL('image/png'); // 将 canvas 转换为 base64 格式的 URL
            link.click(); // 模拟点击下载
        });
    });
});