document.addEventListener('DOMContentLoaded', () => {

    /**
     * ===============================================
     * 1. DOM 元素仓库
     * ===============================================
     * 集中管理所有的 DOM 查询，方便维护。
     */
    const dom = {
        // 容器
        imageContainer: document.getElementById('image-container'),
        reasonRadioGroup: document.getElementById('reason-radio-group'),
        classCheckboxGroup: document.getElementById('class-checkbox-group'),

        // 图片元素
        backgroundImg: document.getElementById('background-img'),
        qrCodeOverlay: document.getElementById('qr-code-overlay'),
        textOverlays: Array.from(document.querySelectorAll('.text-overlay')),

        // 内容输入框
        inputs: {
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
        },

        // 图片上的文本覆盖层
        overlays: {
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
        },

        // 样式和位置控制
        leftPosInput: document.getElementById('left-pos-input'),
        fontSizeInput: document.getElementById('font-size-input'),
        imageSwitch: document.getElementById('image-switch'),
        advancedPositionInputs: document.querySelectorAll('.advanced-settings input[type="number"]'),

        // 二维码控制
        qrCodeInput: document.getElementById('qr-code-input'),
        qrCodeSizeInput: document.getElementById('qr-code-size-input'),
        qrCodeLeftInput: document.getElementById('qr-code-left-input'),
        qrCodeTopInput: document.getElementById('qr-code-top-input'),
        qrCodeGenerateBtn: document.getElementById("qrcode-generate-button"),

        // 详细设置中的快捷操作
        offsetInput: document.getElementById('offset-input'),
        applyOffsetBtn: document.getElementById('apply-offset-btn'),
        resetDefaultsBtn: document.getElementById('reset-defaults-btn'),

        // 操作按钮
        generatePreviewBtn: document.getElementById('generate-preview-btn'),
        downloadHtmlBtn: document.getElementById('download-html-btn'),

        // 预览模态框
        modal: document.getElementById('fullscreen-modal'),
        modalContent: document.getElementById('modal-content'),
        closeModalBtn: document.querySelector('.close-btn'),

        // 帮助图标
        helpIcons: document.querySelectorAll('.help-icon')
    };

    /**
     * ===============================================
     * 2. 模态框管理器 (Modal Manager)
     * ===============================================
     * 负责模态框的显示、关闭和浏览器历史记录。
     */
    const modalManager = {
        show(content, state = 'modal', hash = '#modal') {
            dom.modalContent.innerHTML = '';
            dom.modalContent.appendChild(content);
            dom.modal.style.display = 'flex';
            history.pushState({ page: state }, '', hash);
        },

        close() {
            dom.modal.style.display = 'none';
        },

        init() {
            // 监听浏览器后退
            window.addEventListener('popstate', () => {
                this.close();
            });

            // 监听关闭按钮
            dom.closeModalBtn.addEventListener('click', () => history.back());

            // 监听模态框背景点击
            dom.modal.addEventListener('click', (e) => {
                if (e.target === dom.modal) {
                    history.back();
                }
            });
        }
    };

    /**
     * ===============================================
     * 3. 帮助提示管理器 (Tooltip Manager)
     * ===============================================
     * 负责处理所有帮助 (?) 图标的点击和提示框显示/隐藏。
     */
    const tooltipManager = {
        closeAll(exceptThis = null) {
            const allTooltips = document.querySelectorAll('.help-tooltip.show');
            allTooltips.forEach((tooltip) => {
                if (tooltip !== exceptThis) {
                    tooltip.classList.remove('show');
                }
            });
        },

        init() {
            dom.helpIcons.forEach(icon => {
                icon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const tooltip = icon.nextElementSibling;
                    this.closeAll(tooltip);
                    tooltip.classList.toggle('show');
                });
            });

            // 点击窗口其他地方关闭
            window.addEventListener('click', () => {
                this.closeAll(null);
            });
        }
    };

    /**
     * ===============================================
     * 4. 图片生成器 (Image Generator)
     * ===============================================
     * 负责核心功能：更新文本、调整样式、处理二维码、生成预览图。
     */
    const imageGenerator = {
        // 更新文本覆盖层
        updateText(key) {
            if (dom.inputs[key] && dom.overlays[key]) {
                dom.overlays[key].textContent = dom.inputs[key].value;
            }
        },

        updateReason() {
            const selectedReason = document.querySelector('input[name="reason"]:checked');
            if (selectedReason) {
                dom.overlays.reason.textContent = selectedReason.value;
            }
        },

        updateClasses() {
            const selectedClasses = Array.from(dom.classCheckboxGroup.querySelectorAll('input:checked'))
                .map(cb => cb.value);
            dom.overlays.class.textContent = `[${selectedClasses.join(', ')}]`;
        },

        // 更新样式和位置
        updateTextHorizontalPosition() {
            const left = dom.leftPosInput.value;
            dom.textOverlays.forEach((el) => {
                el.style.left = `${left}px`;
            });
        },

        updateTextVerticalPosition(inputElement) {
            const targetId = inputElement.dataset.target;
            const targetOverlay = document.getElementById(targetId);
            if (targetOverlay) {
                targetOverlay.style.top = `${inputElement.value}px`;
            }
        },

        updateTextStyles() {
            const fontSize = dom.fontSizeInput.value;
            dom.textOverlays.forEach(el => {
                el.style.fontSize = `${fontSize}px`;
            });
        },

        // 快捷操作
        applyVerticalOffset() {
            const offset = parseInt(dom.offsetInput.value, 10);
            if (isNaN(offset)) return;

            dom.advancedPositionInputs.forEach(input => {
                if (input.dataset.target) {
                    const currentValue = parseInt(input.value, 10);
                    if (!isNaN(currentValue)) {
                        input.value = currentValue + offset;
                        this.updateTextVerticalPosition(input);
                    }
                }
            });
        },

        resetVerticalPositions() {
            dom.advancedPositionInputs.forEach(input => {
                if (input.dataset.target) {
                    input.value = input.defaultValue;
                    this.updateTextVerticalPosition(input);
                }
            });
        },

        // 二维码相关
        updateQrCodeSize() {
            const size = dom.qrCodeSizeInput.value;
            if (size > 0) {
                dom.qrCodeOverlay.style.width = `${size}px`;
                dom.qrCodeOverlay.style.height = `${size}px`;
            }
        },

        updateQrCodePosition() {
            dom.qrCodeOverlay.style.left = `${dom.qrCodeLeftInput.value}px`;
            dom.qrCodeOverlay.style.top = `${dom.qrCodeTopInput.value}px`;
        },

        switchBackground(isFinalVersion) {
            dom.backgroundImg.src = isFinalVersion ? "whiteboard.png" : "original.png";
            dom.qrCodeOverlay.style.opacity = isFinalVersion ? '1' : '0.5';
        },

        generateRemoteQrCode() {
            // 注意：你这里的 axios.post 没有处理返回结果，只是发起了请求
            // 你可能需要 .then(response => { ... }) 来处理返回的二维码数据
            axios.post('https://www.u1853627.nyat.app:54257/auto-generate-leaver/')
                .then(response => {
                    console.log("二维码生成请求成功:", response.data);
                    // 假设 response.data.qrCodeUrl 是返回的图片URL
                    // dom.qrCodeOverlay.src = response.data.qrCodeUrl; 
                    // ...后续处理
                })
                .catch(error => {
                    console.error("二维码生成失败:", error);
                    alert("自动生成二维码失败！");
                });
        },

        // 拖拽功能
        makeDraggable(element) {
            let isDragging = false, offsetX, offsetY;
            
            const startDrag = (e) => {
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
            };

            const onMove = (e) => {
                if (!isDragging) return;
                const containerRect = dom.imageContainer.getBoundingClientRect();
                const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
                let newLeft = clientX - containerRect.left - offsetX;
                let newTop = clientY - containerRect.top - offsetY;
                newLeft = Math.max(0, Math.min(newLeft, containerRect.width - element.offsetWidth));
                newTop = Math.max(0, Math.min(newTop, containerRect.height - element.offsetHeight));
                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;
                dom.qrCodeLeftInput.value = Math.round(newLeft);
                dom.qrCodeTopInput.value = Math.round(newTop);
            };

            const stopDrag = () => {
                isDragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchend', stopDrag);
            };

            element.addEventListener('mousedown', startDrag);
            element.addEventListener('touchstart', startDrag);
        },

        // 最终生成预览
        generatePreview() {
            const loadingMessage = document.createElement('p');
            loadingMessage.textContent = '正在生成图片...';
            loadingMessage.className = 'loading';
            modalManager.show(loadingMessage, 'generate', '#generate');

            html2canvas(dom.imageContainer, {
                useCORS: true,
                backgroundColor: null,
                scale: 2
            }).then(canvas => {
                const image = new Image();
                image.src = canvas.toDataURL('image/png');
                image.style.maxWidth = '90vw';
                image.style.maxHeight = '80vh';
                image.style.objectFit = 'contain';

                const instruction = document.createElement('p');
                instruction.className = 'save-instruction';
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                instruction.textContent = isMobile ? '长按图片保存到相册' : '右键点击图片另存为';

                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.alignItems = 'center';
                container.appendChild(image);
                container.appendChild(instruction);

                modalManager.show(container, 'generate', '#generate');
            }).catch(error => {
                console.error('生成图片失败:', error);
                alert('生成图片失败,请重试');
                modalManager.close();
            });
        },

        // 初始化
        init() {
            // 1. 绑定文本输入框
            for (const key in dom.inputs) {
                dom.inputs[key].addEventListener('input', () => this.updateText(key));
            }

            // 2. 绑定单选/多选
            dom.reasonRadioGroup.addEventListener('change', () => this.updateReason());
            dom.classCheckboxGroup.addEventListener('change', () => this.updateClasses());

            // 3. 绑定样式和位置控制
            dom.leftPosInput.addEventListener('input', () => this.updateTextHorizontalPosition());
            dom.fontSizeInput.addEventListener('input', () => this.updateTextStyles());
            dom.advancedPositionInputs.forEach(input => {
                input.addEventListener('input', () => this.updateTextVerticalPosition(input));
                this.updateTextVerticalPosition(input); // 初始化位置
            });

            // 4. 绑定快捷操作
            dom.applyOffsetBtn.addEventListener('click', () => this.applyVerticalOffset());
            dom.resetDefaultsBtn.addEventListener('click', () => this.resetVerticalPositions());

            // 5. 绑定二维码相关
            const reader = new FileReader();
            reader.onload = (event) => {
                dom.qrCodeOverlay.src = event.target.result;
                dom.qrCodeOverlay.style.display = 'block';
                this.updateQrCodeSize();
                this.updateQrCodePosition();
            };
            dom.qrCodeInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    reader.readAsDataURL(file);
                }
            });
            dom.qrCodeSizeInput.addEventListener('input', () => this.updateQrCodeSize());
            dom.qrCodeLeftInput.addEventListener('input', () => this.updateQrCodePosition());
            dom.qrCodeTopInput.addEventListener('input', () => this.updateQrCodePosition());
            dom.qrCodeGenerateBtn.addEventListener('click', () => this.generateRemoteQrCode());

            // 6. 绑定底图切换
            dom.imageSwitch.addEventListener('change', (e) => this.switchBackground(e.target.checked));

            // 7. 绑定拖拽
            this.makeDraggable(dom.qrCodeOverlay);
            
            // 8. 绑定生成预览按钮
            dom.generatePreviewBtn.addEventListener('click', () => this.generatePreview());

            // 9. 初始化默认值
            this.updateTextHorizontalPosition();
            this.updateTextStyles();
            this.updateReason();
            this.updateClasses();
            this.updateQrCodePosition();
        }
    };

    /**
     * ===============================================
     * 5. HTML 下载器 (HTML Downloader)
     * ===============================================
     * 负责生成和下载 HTML 文件。
     */
    const htmlDownloader = {
        _downloadFile(content, filename) {
            const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        },

        _getClassPeriodsFromForm() {
            const selectedClasses = Array.from(dom.classCheckboxGroup.querySelectorAll('input:checked'))
                .map(cb => cb.value);
            return selectedClasses.length > 0 ? selectedClasses.join(' ') : "";
        },

        async handleDownloadClick() {
            // 1. 从 DOM 获取数据
            const data = {
                name: dom.inputs.name.value,
                id: dom.inputs.studentId.value,
                reason: document.querySelector('input[name="reason"]:checked')?.value || '',
                description: dom.inputs.description.value,
                destination: dom.inputs.destination.value,
                start: dom.inputs.start.value,
                class: this._getClassPeriodsFromForm(),
                teacher: dom.inputs.teacher.value,
            };

            // 2. 验证
            if (!data.name || !data.id || !data.reason || !data.description || !data.destination || !data.start || !data.teacher) {
                alert('请填写所有必填字段(姓名、学号、请假原因、原因描述、目的地、开始时间、审核人)');
                return;
            }

            // 3. 加载和填充模板
            try {
                const response = await fetch('template.html');
                if (!response.ok) {
                    alert('无法加载模板文件!');
                    return;
                }
                let templateContent = await response.text();

                const filledContent = templateContent
                    .replace(/{{name}}/g, data.name)
                    .replace(/{{id}}/g, data.id)
                    .replace(/{{reason}}/g, data.reason)
                    .replace(/{{description}}/g, data.description)
                    .replace(/{{destination}}/g, data.destination)
                    .replace(/{{start}}/g, data.start)
                    .replace(/{{class}}/g, data.class)
                    .replace(/{{teacher}}/g, data.teacher);

                // 4. 下载
                this._downloadFile(filledContent, `leaver-${data.id}.html`);

            } catch (error) {
                console.error('生成文件时出错:', error);
                alert('生成文件失败,请检查控制台获取更多信息。');
            }
        },

        init() {
            dom.downloadHtmlBtn.addEventListener('click', () => this.handleDownloadClick());
        }
    };

    /**
     * ===============================================
     * 6. 应用初始化 (App Initialization)
     * ===============================================
     * 总入口，负责启动所有模块。
     */
    function initialize() {
        // 清除 URL hash
        if (location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }
        
        // 初始化各个模块
        modalManager.init();
        tooltipManager.init();
        imageGenerator.init();
        htmlDownloader.init();
    }

    // 启动应用
    initialize();
});