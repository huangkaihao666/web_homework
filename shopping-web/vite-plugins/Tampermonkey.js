// ==UserScript==
// @name         Shift Click CSS-Mark Collector
// @namespace    http://your-namespace-here
// @version      1.0
// @description  Capture shift-click and send css-mark attributes up the DOM tree to window.opener
// @match        http://localhost:5173/*
// @grant        none
// @require https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js
// ==/UserScript==

(function() {
    'use strict';

    let highlightedElement = null; // 当前页面中被高亮的元素
    let customDialog = null; // 自定义对话框的 DOM 元素
    let hoveredListItem = null; // 对话框中当前被悬停的列表项
    const originalBorderStyles = new Map(); // 存储原始边框样式以便在取消悬停时恢复
    const prefix = 'css-vite-mark-'; // 特殊class前缀
    const overlayColor = 'rgba(255, 0, 0, 0.1)'; // 页面中高亮的基础覆盖颜色
    const highlightBorderColor = 'red'; // 元素高亮时的边框颜色
    const hoverHighlightBorderColor = 'red'; // 停时的边框颜色
    const dialogBorderColor = '#007bff'; // 对话框的蓝色边框颜色
    const listItemHoverColor = '#cce5ff'; // 列表项悬停时的浅蓝色背景

    let rootPath = localStorage.getItem('cssMarkRootPath') || ''; // 从本地存储获取根路径

    let inspectEnabled = false; // 检查功能是否启用

    let showLocateButton = false; // 控制定位按钮的显示

    // 创建并添加启动/停止按钮
    function createToggleButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.top = '10px';
        buttonContainer.style.left = '50%';
        buttonContainer.style.transform = 'translateX(-50%)';
        buttonContainer.style.zIndex = '10001';
        buttonContainer.style.cursor = 'move';

        const toggleButton = document.createElement('button');
        toggleButton.textContent = '启动 Inspect';
        toggleButton.style.padding = '10px 20px';
        toggleButton.style.backgroundColor = dialogBorderColor;
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '5px';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';

        // 拖动相关变量
        let isDragging = false;
        let startX, startY, initialX, initialY, offsetX, offsetY;

        // 添加拖动阈值，用于判断是否发生了拖动
        const dragThreshold = 5;

        // 添加鼠标按下事件监听器
        buttonContainer.addEventListener('mousedown', (e) => {
            isDragging = false; // 重置拖动状态
            startX = e.clientX;
            startY = e.clientY;

            const rect = buttonContainer.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;

            // 在拖动开始时，移除 transform 样式，并将 left 调整为实际像素值
            buttonContainer.style.left = `${initialX}px`;
            buttonContainer.style.transform = '';

            // 计算鼠标在按钮内的相对位置
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // 鼠标移动事件处理函数
        function onMouseMove(e) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // 判断移动距离是否超过阈值，超过则认为是拖动
            if (!isDragging && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) {
                isDragging = true;
            }

            if (isDragging) {
                // 使用鼠标当前位置减去按钮内的偏移量来计算新位置
                buttonContainer.style.left = (e.clientX - offsetX) + 'px';
                buttonContainer.style.top = (e.clientY - offsetY) + 'px';
            }
        }

        // 鼠标抬起事件处理函数
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        // 点击按钮事件处理
        toggleButton.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止点击事件干扰拖动

            if (isDragging) {
                // 如果发生了拖动，阻止点击事件
                e.preventDefault();
                return;
            }

            if (!inspectEnabled) {
                startInspect();
                toggleButton.textContent = '停止 Inspect';
            } else {
                stopInspect();
                toggleButton.textContent = '启动 Inspect';
            }
        });

        // 创建搜索按钮
        const searchButton = document.createElement('button');
        searchButton.textContent = '搜索组件';
        searchButton.style.padding = '10px 20px';
        searchButton.style.backgroundColor = dialogBorderColor;
        searchButton.style.color = 'white';
        searchButton.style.border = 'none';
        searchButton.style.borderRadius = '5px';
        searchButton.style.cursor = 'pointer';
        searchButton.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
        searchButton.style.marginLeft = '10px';  // 与启动按钮保持间距

        searchButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isDragging) {
                e.preventDefault();
                return;
            }
            showSearchDialog();
        });

        buttonContainer.appendChild(toggleButton);
        buttonContainer.appendChild(searchButton);
        document.body.appendChild(buttonContainer);
    }

    // 启动检查功能
    function startInspect() {
        inspectEnabled = true;
        highlightCssMarkElements();

        // 为主文档添加事件监听
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick, true);

        // 为所有 iframe 添加事件监听
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                iframe.contentDocument.addEventListener('mousemove', handleMouseMove);
                iframe.contentDocument.addEventListener('click', handleClick, true);
            } catch (e) {
                console.warn('无法访问iframe内容:', e);
            }
        });
    }

    // 停止检查功能
    function stopInspect() {
        inspectEnabled = false;
        removeHighlightFromCssMarkElements();

        // 移除主文档的事件监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick, true);

        // 移除所有 iframe 的事件监听
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                iframe.contentDocument.removeEventListener('mousemove', handleMouseMove);
                iframe.contentDocument.removeEventListener('click', handleClick, true);
            } catch (e) {
                console.warn('无法访问iframe内容:', e);
            }
        });
    }

    // 返回css-vite-mark的class值
    function getCssMarkClass(element) {
        const classList = element.classList;
        for (let i = 0; i < classList.length; i++) {
            const className = classList[i];
            if (className.startsWith('css-vite-mark')) {
                return className;
            }
        }
        return ''
    }
    // 返回class中包含css-vite-mark的元素
    function getCssMarkClassElement(root) {
        const allElements = root.querySelectorAll('*');
        // 过滤出 classList 中包含以 css-vite-mark 开头的类的元素
        return Array.from(allElements).filter(function(element) {
            return Array.from(element.classList).some(function(className) {
                return className.startsWith('css-vite-mark');
            });
        });
    }
    // 函数：给所有具有 css-mark 属性的元素添加红色边框和3D效果
    function highlightCssMarkElements() {
        // 高亮主文档中的元素
        const elements = getCssMarkClassElement(document);
        elements.forEach(element => {
            element.style.border = '2px solid red';
            element.style.transition = 'transform 0.3s, box-shadow 0.3s';
        });

        // 高亮所有 iframe 中的元素
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                const iframeElements = getCssMarkClassElement(iframe.contentDocument);
                iframeElements.forEach(element => {
                    element.style.border = '2px solid red';
                    element.style.transition = 'transform 0.3s, box-shadow 0.3s';
                });
            } catch (e) {
                console.warn('无法访问iframe内容:', e);
            }
        });
    }

    // 函数：移除所有具有 css-mark 属性的元素的红色边框和3D效果
    function removeHighlightFromCssMarkElements() {
        // 移除主文档中元素的高亮
        const elements = getCssMarkClassElement(document);
        elements.forEach(element => {
            element.style.border = '';
            element.style.backgroundImage = '';
            element.style.transform = '';
            element.style.boxShadow = '';
            element.style.transition = '';
        });

        // 移除所有 iframe 中元素的高亮
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                const iframeElements = getCssMarkClassElement(iframe.contentDocument);
                iframeElements.forEach(element => {
                    element.style.border = '';
                    element.style.backgroundImage = '';
                    element.style.transform = '';
                    element.style.boxShadow = '';
                    element.style.transition = '';
                });
            } catch (e) {
                console.warn('无法访问iframe内容:', e);
            }
        });
        highlightedElement = null;
    }

    // 函数：为元素应用覆盖效果
    function applyOverlay(element) {
        const currentOverlay = element.style.backgroundImage;
        const overlayLayer = `linear-gradient(${overlayColor}, ${overlayColor})`;

        // 叠加覆盖颜色层
        element.style.backgroundImage = currentOverlay ? `${currentOverlay}, ${overlayLayer}` : overlayLayer;
    }

    // 函数：为元素应用边框高亮和3D效果
    function applyBorderHighlight(element, isHover = false) {
        if (!originalBorderStyles.has(element)) {
            originalBorderStyles.set(element, element.style.border); // 保存原始边框
        }
        const borderWidth = isHover ? '3px' : '2px';
        element.style.border = `${borderWidth} solid ${highlightBorderColor}`;

        const elementWidth = element.offsetWidth;

        // 检查是否为最顶层组件（例如，没有父元素具有 css-mark 属性）
        let isTopLevel = true;
        let parent = element.parentElement;
        while (parent) {
            if (getCssMarkClass(parent)) {
                isTopLevel = false;
                break;
            }
            parent = parent.parentElement;
        }

        if (!isTopLevel && elementWidth <= 400) {
            element.style.transform = 'scale(1.02)'; // 缩放幅度调整为 1.02
            element.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        }

        element.style.transition = 'transform 0.3s, box-shadow 0.3s';
    }

    // 函数：移除元素的边框高亮和3D效果
    function removeBorderHighlight(element) {
        if (originalBorderStyles.has(element)) {
            element.style.border = originalBorderStyles.get(element); // 恢复原始边框
            element.style.transform = '';
            element.style.boxShadow = '';
            element.style.transition = '';
            originalBorderStyles.delete(element);
        }
    }

    // 函数：移除元素的覆盖效果
    function removeOverlay(element) {
        element.style.backgroundImage = '';
    }

    // 函数：收集从顶层到当前元素的 css-mark 属性列表
    function collectCssMarkHierarchy(element) {
        const cssMarkList = [];
        while (element) {
            const cssClassName = getCssMarkClass(element);
            if (cssClassName) {
                cssMarkList.push({ element, originMark: cssClassName });
            }
            element = element.parentElement;
        }
        return cssMarkList;
    }

    // 函数：使对话框可以通过点击和动标题进行拖动
    function makeDialogDraggable(dialog, handle) {
        let isDragging = false;
        let offsetX, offsetY;

        handle.style.cursor = 'move';

        handle.addEventListener('mousedown', function(e) {
            isDragging = true;
            const rect = dialog.getBoundingClientRect();
            dialog.style.left = `${rect.left}px`;
            dialog.style.top = `${rect.top}px`;
            dialog.style.transform = 'none';
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.addEventListener('mousemove', moveDialog);
            document.addEventListener('mouseup', stopDragging);
        });

        function moveDialog(e) {
            if (isDragging) {
                dialog.style.left = (e.clientX - offsetX) + 'px';
                dialog.style.top = (e.clientY - offsetY) + 'px';
            }
        }

        function stopDragging() {
            isDragging = false;
            document.removeEventListener('mousemove', moveDialog);
            document.removeEventListener('mouseup', stopDragging);
        }
    }

    // 函数：创建并显示包含 css-mark 层级和打开按钮的自定义对话框
    function showCustomDialog(cssMarkList) {
        // 保存当前对话框的位置（如果存在的话）
        let previousPosition = null;
        if (customDialog) {
            previousPosition = {
                left: customDialog.style.left,
                top: customDialog.style.top
            };
            customDialog.remove();
        }

        customDialog = document.createElement('div');
        customDialog.style.position = 'fixed';

        // 在没有 previousPosition 的情况下，计算居中位置
        if (!previousPosition || !previousPosition.left || !previousPosition.top) {
            // 设置对话框的初始宽高
            const dialogWidth = 800; // 初始宽度，可以根据需要调整
            const dialogHeight = 300; // 初始高度，可以根据需要调整

            // 获取视口寸
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // 计算居中位置
            customDialog.style.left = (viewportWidth - dialogWidth) / 2 + 'px';
            customDialog.style.top = (viewportHeight - dialogHeight) / 2 + 'px';

            // 设置对话框的初始宽高
            customDialog.style.width = dialogWidth + 'px';
            customDialog.style.height = dialogHeight + 'px';
        } else {
            // 使用之前保存的位置
            customDialog.style.left = previousPosition.left;
            customDialog.style.top = previousPosition.top;
            customDialog.style.width = previousPosition.width;
            customDialog.style.height = previousPosition.height;
        }

        // 移除 transform 属性
        // customDialog.style.transform = 'translate(-50%, -50%)';

        customDialog.style.padding = '0';
        customDialog.style.backgroundColor = 'white';
        customDialog.style.border = `2px solid ${dialogBorderColor}`;
        customDialog.style.borderRadius = '0';
        customDialog.style.zIndex = '10000';
        customDialog.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.3)';
        customDialog.style.maxWidth = '70vw';
        customDialog.style.minWidth = '800px';
        customDialog.style.display = 'flex';
        customDialog.style.flexDirection = 'column';
        customDialog.style.maxHeight = '80vh';

        // 创建标题栏容器
        const titleBar = document.createElement('div');
        titleBar.style.display = 'flex';
        titleBar.style.alignItems = 'center';
        titleBar.style.padding = '10px';
        titleBar.style.marginBottom = '0';
        titleBar.style.borderBottom = '1px solid #e0e0e0';
        titleBar.style.cursor = 'move';
        titleBar.style.backgroundColor = '#f8f9fa';
        titleBar.style.borderTopLeftRadius = '0';
        titleBar.style.borderTopRightRadius = '0';

        // 添加拖动图标
        const dragIcon = document.createElement('span');
        dragIcon.innerHTML = '⋮⋮'; // 使用点状字符作为拖动图标
        dragIcon.style.marginRight = '10px';
        dragIcon.style.color = '#666';
        dragIcon.style.fontSize = '16px';
        dragIcon.style.userSelect = 'none';

        const titleContainer = document.createElement('div');
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
        titleContainer.style.gap = '10px';
        titleContainer.style.flex = '1';

        const title = document.createElement('h3');
        title.textContent = '组件源代码';
        title.style.margin = '0';
        title.style.color = dialogBorderColor;
        title.style.userSelect = 'none';

        // 添加配置按钮到标题旁边
        const configButton = document.createElement('button');
        configButton.textContent = '配置';
        configButton.style.padding = '3px 8px';
        configButton.style.backgroundColor = dialogBorderColor;
        configButton.style.color = 'white';
        configButton.style.border = 'none';
        configButton.style.borderRadius = '4px';
        configButton.style.cursor = 'pointer';
        configButton.onclick = showConfigDialog;

        titleContainer.appendChild(title);
        titleContainer.appendChild(configButton);

        titleBar.appendChild(dragIcon);
        titleBar.appendChild(titleContainer);
        customDialog.appendChild(titleBar);

        // 修改拖动处理，使用新的titleBar
        makeDialogDraggable(customDialog, titleBar);

        // 添加带有垂直滚动的列表容器
        const listContainer = document.createElement('div');
        listContainer.style.overflowY = 'auto';
        listContainer.style.flexGrow = '1';
        listContainer.style.maxHeight = 'calc(80vh - 160px)'; // 根据标题按钮高度调整

        const list = document.createElement('ul');
        list.style.paddingLeft = '0';
        list.style.listStyleType = 'none';

        cssMarkList.forEach(item => {
            const listItem = document.createElement('li');
            listItem.style.display = 'flex';
            listItem.style.alignItems = 'center';
            listItem.style.padding = '5px';
            listItem.style.borderRadius = '0';
            listItem.style.transition = 'background-color 0.2s';

            // 添加复制按钮
            const copyButton = document.createElement('button');
            copyButton.textContent = '复制';
            copyButton.style.marginRight = '10px';
            copyButton.style.backgroundColor = dialogBorderColor;
            copyButton.style.color = 'white';
            copyButton.style.border = 'none';
            copyButton.style.padding = '3px 8px';
            copyButton.style.cursor = 'pointer';
            copyButton.onclick = function() {
                navigator.clipboard.writeText(item.mark).then(() => {
                    // 临时改变按钮文字显示复制成功
                    copyButton.textContent = '已复制';
                    setTimeout(() => {
                        copyButton.textContent = '复制';
                    }, 1000);
                });
            };

            // 为每个项目添加"打开"按钮
            const openButton = document.createElement('button');
            openButton.textContent = '打开';
            openButton.style.marginRight = '10px';
            openButton.style.backgroundColor = dialogBorderColor;
            openButton.style.color = 'white';
            openButton.style.border = 'none';
            openButton.style.padding = '3px 8px';
            openButton.style.cursor = 'pointer';
            openButton.onclick = function() {
                openInVSCode(item.mark);
            };

            // 添加"定位"按钮，根据 showLocateButton 控制显示
            const positionButton = document.createElement('button');
            positionButton.textContent = '定位';
            positionButton.style.marginRight = '10px';
            positionButton.style.backgroundColor = dialogBorderColor;
            positionButton.style.color = 'white';
            positionButton.style.border = 'none';
            positionButton.style.padding = '3px 8px';
            positionButton.style.cursor = 'pointer';
            positionButton.style.display = showLocateButton ? 'inline-block' : 'none'; // 根据变量控制显示
            positionButton.onclick = function() {
                const message = { type: 'locate', data: item.mark };
                window.opener.postMessage(JSON.stringify(message), '*');
            };

            // 为列表项添加悬停效果，突出显示并应用3D效果
            listItem.onmouseover = function() {
                // 移除所有高亮
                removeHighlightFromCssMarkElements();
                // 应用当前元素高亮，边框设置为3px
                applyOverlay(item.element);
                applyBorderHighlight(item.element, true);
                hoveredListItem = item.element;
                // 设置列表项背景色
                listItem.style.backgroundColor = listItemHoverColor;
            };
            listItem.onmouseout = function() {
                // 移除当前元素高亮
                listItem.style.backgroundColor = '';
                if (hoveredListItem) {
                    removeOverlay(hoveredListItem);
                    removeBorderHighlight(hoveredListItem);
                    hoveredListItem = null;
                }
                // 恢复所有元素的默认高亮（2px）
                highlightCssMarkElements();
            };

            const text = document.createElement('span');
            text.textContent = item.mark;
            text.style.flex = '1';
            text.style.wordBreak = 'break-all'; // 不按照单词折行

            listItem.appendChild(copyButton); // 添加复制按钮到列表项
            listItem.appendChild(openButton);
            listItem.appendChild(positionButton);
            listItem.appendChild(text);
            list.appendChild(listItem);
        });
        listContainer.appendChild(list);
        customDialog.appendChild(listContainer);

        // 添加"关闭"按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '×'; // 改为 × 符号
        closeButton.style.position = 'absolute';
        closeButton.style.right = '10px';
        closeButton.style.top = '5px';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.color = '#666';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0';
        closeButton.style.width = '24px';
        closeButton.style.height = '24px';
        closeButton.style.display = 'flex';
        closeButton.style.alignItems = 'center';
        closeButton.style.justifyContent = 'center';
        closeButton.style.borderRadius = '50%';
        closeButton.style.transition = 'all 0.2s';

        // 添加悬停效果
        closeButton.onmouseover = function() {
            closeButton.style.backgroundColor = '#f0f0f0';
            closeButton.style.color = '#333';
        };
        closeButton.onmouseout = function() {
            closeButton.style.backgroundColor = 'transparent';
            closeButton.style.color = '#666';
        };

        // 添加点击事件处理
        closeButton.onclick = function() {
            customDialog.remove();
        };

        customDialog.appendChild(closeButton);

        // 将对话框添加到页面主体
        document.body.appendChild(customDialog);

        customDialog.style.resize = 'both'; // 允许调整大小
        customDialog.style.overflow = 'auto'; // 允许内容溢出时显示滚动条
        customDialog.style.minWidth = '400px'; // 设置最小宽度
        customDialog.style.minHeight = '200px'; // 设置最小高度

        // 修改最大宽高的限制
        customDialog.style.maxWidth = '90vw';
        customDialog.style.maxHeight = '90vh';

        // 修改列表容器的最大高度计算方式
        listContainer.style.maxHeight = 'calc(100% - 60px)'; // 60px 是标题栏的高度
    }

    // 函数：处理鼠标移动事件，应用覆盖效果到悬停的 css-mark 元素或其子元素
    function handleMouseMove(event) {
        let element = event.target;

        // 遍历 DOM 树查找最近的具有 css-mark 属性的祖先元素
        while (element && !getCssMarkClass(element)) {
            element = element.parentElement;
        }

        if (element && getCssMarkClass(element)) {
            if (highlightedElement !== element) {
                if (highlightedElement) {
                    removeOverlay(highlightedElement); // 从之前的元素移除覆盖
                    removeBorderHighlight(highlightedElement);
                }
                applyOverlay(element); // 应用覆盖到新的元素
                applyBorderHighlight(element);
                highlightedElement = element;
            }
        } else if (highlightedElement) {
            removeOverlay(highlightedElement); // 不再悬停在 css-mark 元素上时移除覆盖
            removeBorderHighlight(highlightedElement);
            highlightedElement = null;
        }
    }

    // 函数：处理点击事件并显示 css-mark 层级
    function handleClick(event) {
        let element = event.target;

        // 遍历 DOM 树查找最近的具有 css-mark 属性的祖先元素
        while (element && !getCssMarkClass(element)) {
            element = element.parentElement;
        }

        if (element && getCssMarkClass(element)) {
            event.stopPropagation();
            event.preventDefault();
            const cssMarkList = collectCssMarkHierarchy(element);
            cssMarkList.forEach(item => {
                item.mark = LZString.decompressFromBase64(item.originMark.substring(prefix.length)).replace(/.*\/(packages\/customer-service)/, '$1');
            });
            showCustomDialog(cssMarkList);
        }
    }

    // 函数：在 VSCode 中打开文件
    function openInVSCode(mark) {
        if (!rootPath) {
            // 如果没有配置根路径,显示配置对话框
            showConfigDialog();
            return;
        }
        const relativePath = mark;
        const fullPath = `${rootPath}/${relativePath}`;
        const vscodeUri = `vscode://file/${fullPath}`;
        window.open(vscodeUri);
    }

    // 添加配置对话框函数
    function showConfigDialog() {
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.padding = '20px';
        dialog.style.backgroundColor = 'white';
        dialog.style.border = `2px solid ${dialogBorderColor}`;
        dialog.style.borderRadius = '5px';
        dialog.style.zIndex = '10002';
        dialog.style.minWidth = '400px';
        dialog.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.3)';

        const title = document.createElement('h3');
        title.textContent = '配置';
        title.style.margin = '0 0 20px 0';
        title.style.color = dialogBorderColor;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = rootPath;
        input.placeholder = '请输入项目根路径';
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.marginBottom = '20px';
        input.style.boxSizing = 'border-box';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';

        const saveButton = document.createElement('button');
        saveButton.textContent = '保存';
        saveButton.style.padding = '8px 16px';
        saveButton.style.backgroundColor = dialogBorderColor;
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '4px';
        saveButton.style.cursor = 'pointer';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.backgroundColor = '#6c757d';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.cursor = 'pointer';

        saveButton.onclick = () => {
            rootPath = input.value;
            localStorage.setItem('cssMarkRootPath', rootPath);
            dialog.remove();
        };

        cancelButton.onclick = () => dialog.remove();

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);

        dialog.appendChild(title);
        dialog.appendChild(input);
        dialog.appendChild(buttonContainer);
        document.body.appendChild(dialog);
    }

    // 添加搜索对话框函数
    function showSearchDialog() {
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'white';
        dialog.style.border = `2px solid ${dialogBorderColor}`;
        dialog.style.borderRadius = '5px';
        dialog.style.zIndex = '10002';
        dialog.style.minWidth = '400px';
        dialog.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.3)';
        dialog.style.padding = '0'; // 移除内边距

        // 创建标题栏
        const titleBar = document.createElement('div');
        titleBar.style.display = 'flex';
        titleBar.style.alignItems = 'center';
        titleBar.style.padding = '10px';
        titleBar.style.borderBottom = '1px solid #e0e0e0';
        titleBar.style.cursor = 'move';
        titleBar.style.backgroundColor = '#f8f9fa';

        // 添加拖动图标
        const dragIcon = document.createElement('span');
        dragIcon.innerHTML = '⋮⋮';
        dragIcon.style.marginRight = '10px';
        dragIcon.style.color = '#666';
        dragIcon.style.fontSize = '16px';
        dragIcon.style.userSelect = 'none';

        const title = document.createElement('h3');
        title.textContent = '搜索组件';
        title.style.margin = '0';
        title.style.color = dialogBorderColor;
        title.style.flex = '1';
        title.style.userSelect = 'none';

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0 10px';
        closeButton.style.color = '#666';
        closeButton.onclick = () => dialog.remove();

        titleBar.appendChild(dragIcon);
        titleBar.appendChild(title);
        titleBar.appendChild(closeButton);

        // 创建内容容器
        const content = document.createElement('div');
        content.style.padding = '20px';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '输入组件名称搜索';
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.marginBottom = '20px';
        input.style.boxSizing = 'border-box';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';

        const resultContainer = document.createElement('div');
        resultContainer.style.maxHeight = '300px';
        resultContainer.style.overflowY = 'auto';

        input.addEventListener('input', function() {
            const searchTerm = input.value.toLowerCase();
            const results = searchCssMarkElements(searchTerm);
            displaySearchResults(results, resultContainer);
        });

        content.appendChild(input);
        content.appendChild(resultContainer);

        dialog.appendChild(titleBar);
        dialog.appendChild(content);
        document.body.appendChild(dialog);

        // 使对话框可拖动
        makeDialogDraggable(dialog, titleBar);

        // 在添加到文档后移除transform,以便正确计算拖动位置
        const rect = dialog.getBoundingClientRect();
        dialog.style.transform = 'none';
        dialog.style.top = `${rect.top}px`;
        dialog.style.left = `${rect.left}px`;
    }

    // 搜索 csc-mark 元素的函数
    function searchCscMarkElements(searchTerm) {
        const results = [];

        // 搜索主文档
        const elements = getCscMarkClassElement(document);
        elements.forEach(element => {
            const mark = LZString.decompressFromBase64(getCscMarkClass(element).substring(prefix.length))
                .replace(/.*\/(packages\/customer-service)/, '$1');
            if (mark.toLowerCase().includes(searchTerm)) {
                results.push({ element, mark });
            }
        });

        // 搜索所有 iframe
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                const iframeElements = getCscMarkClassElement(iframe.contentDocument);
                iframeElements.forEach(element => {
                    const mark = LZString.decompressFromBase64(getCscMarkClass(element).substring(prefix.length))
                        .replace(/.*\/(packages\/customer-service)/, '$1');
                    if (mark.toLowerCase().includes(searchTerm)) {
                        results.push({ element, mark });
                    }
                });
            } catch (e) {
                console.warn('无法访问iframe内容:', e);
            }
        });
        return results;
    }
      // 显示搜索结果的函数
    function displaySearchResults(results, container) {
        container.innerHTML = '';

        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.textContent = '未找到匹配的组件';
            noResults.style.padding = '10px';
            noResults.style.color = '#666';
            container.appendChild(noResults);
            return;
        }

        results.forEach(({ element, mark }) => {
            const resultItem = document.createElement('div');
            resultItem.style.padding = '10px';
            resultItem.style.borderBottom = '1px solid #eee';
            resultItem.style.cursor = 'pointer';
            resultItem.style.transition = 'background-color 0.2s';

            resultItem.textContent = mark;

            resultItem.addEventListener('mouseover', () => {
                resultItem.style.backgroundColor = '#f0f0f0';
                highlightElement(element);
            });

            resultItem.addEventListener('mouseout', () => {
                resultItem.style.backgroundColor = '';
                removeHighlightFromCscMarkElements();
                if (inspectEnabled) {
                    highlightCscMarkElements();
                }
            });

            resultItem.addEventListener('click', () => {
                const cscMarkList = collectCscMarkHierarchy(element);
                cscMarkList.forEach(item => {
                    item.mark = LZString.decompressFromBase64(item.originMark.substring(prefix.length))
                        .replace(/.*\/(packages\/customer-service)/, '$1');
                });
                showCustomDialog(cscMarkList);
            });

            container.appendChild(resultItem);
        });
    }

    // 高亮单个元素的函数
    function highlightElement(element) {
        removeHighlightFromCscMarkElements();
        applyOverlay(element);
        applyBorderHighlight(element, true);
    }

    // 初始化时创建启动/停止按钮
    createToggleButton();

  })();