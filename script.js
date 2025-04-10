document.addEventListener('DOMContentLoaded', function() {
    // Web Audio API context
    let audioContext = null;
    let dragOscillator = null;
    let dragGainNode = null;

    // 初始化音频上下文
    function initAudio() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // 创建一个短暂的静音并播放，解锁音频
                const buffer = audioContext.createBuffer(1, 1, 22050);
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start(0);
            } catch(e) {
                console.error('Audio initialization failed:', e);
                return false;
            }
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        return true;
    }

    // 初始化音频
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('mousedown', initAudio, { once: true });

    // Sound effect functions
    function createOscillator(frequency, duration, type = 'sine', volume = 0.1) {
        if (!audioContext) return null;
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            return { oscillator, gainNode };
        } catch(e) {
            console.error("Error creating oscillator:", e);
            return null;
        }
    }

    function playClickSound() {
        const nodes = createOscillator(800, 0.1, 'sine', 0.05);
        if (!nodes) return;
        
        try {
            nodes.oscillator.start();
            nodes.oscillator.stop(audioContext.currentTime + 0.1);
        } catch(e) {
            console.error("Error playing click sound:", e);
        }
    }

    function playEraseSound() {
        const { oscillator } = createOscillator(400, 0.15, 'sine', 0.05);
        oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
    }

    function playToggleSound() {
        const { oscillator } = createOscillator(600, 0.1, 'sine', 0.05);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    function playMoveSound() {
        const { oscillator } = createOscillator(500, 0.1, 'sine', 0.05);
        oscillator.frequency.linearRampToValueAtTime(700, audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    function startDragSound() {
        if (dragOscillator) {
            stopDragSound();
        }
        const nodes = createOscillator(300, 0.5, 'sine', 0.02);
        if (!nodes) return;
        
        dragOscillator = nodes.oscillator;
        dragGainNode = nodes.gainNode;
        
        try {
            dragOscillator.start();
        } catch(e) {
            console.error('Failed to start drag sound:', e);
            dragOscillator = null;
            dragGainNode = null;
        }
    }

    function updateDragSound(progress) {
        if (!dragOscillator || !dragGainNode) return;
        
        try {
            // 根据拖动进度改变音调，从300Hz到600Hz
            const frequency = 300 + (progress * 300);
            dragOscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            // 根据进度调整音量
            const volume = 0.02 + (progress * 0.03); // 音量从0.02到0.05
            dragGainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        } catch(e) {
            console.error('Failed to update drag sound:', e);
        }
    }

    function stopDragSound() {
        if (!dragOscillator) return;
        
        try {
            // 添加淡出效果
            if (dragGainNode) {
                dragGainNode.gain.cancelScheduledValues(audioContext.currentTime);
                dragGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
            }
            dragOscillator.stop(audioContext.currentTime + 0.15);
        } catch(e) {
            console.error('Failed to stop drag sound:', e);
        } finally {
            dragOscillator = null;
            dragGainNode = null;
        }
    }
    // Grid initialization
    const grid = document.querySelector('.grid');
    const gridContainer = document.querySelector('.grid-container');
    const factorLeft = document.querySelector('.factor-left .factor-value');
    const factorRight = document.querySelector('.factor-right .factor-value');
    const resultValue = document.querySelector('.result-value');
    const horizontalDimension = document.querySelector('.dimension-display.horizontal .dimension-value');
    const verticalDimension = document.querySelector('.dimension-display.vertical .dimension-value');
    const circleMarker = document.querySelector('.circle-marker');
    const redDot = document.querySelector('.red-dot');
    const eraserTool = document.querySelector('.eraser-tool');
    const gridIcon = document.querySelector('.grid-icon');

    // Current state
    let rows = 1;
    let columns = 1;
    let gridVisible = true;
    let isRedDotDragging = false;
    
    // Initialize the grid
    function initializeGrid() {
        // Clear existing grid
        grid.innerHTML = '';
        
        // Set grid template
        grid.style.gridTemplateColumns = `repeat(10, 1fr)`;
        grid.style.gridTemplateRows = `repeat(10, 1fr)`;
        
        // Create grid cells (always 10x10)
        for (let i = 0; i < 10 * 10; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            
            grid.appendChild(cell);
        }
        
        // Create horizontal and vertical connecting lines if they don't exist
        createConnectingLines();
        
        // Update dimensions display
        horizontalDimension.textContent = columns;
        verticalDimension.textContent = rows;
        
        // Update factors
        factorLeft.textContent = rows;
        factorRight.textContent = columns;
        
        // Update result
        updateResult();
        
        // Update highlighted area
        updateHighlightedArea();
        
        // Position the grid-resizers to match the grid container
        const gridRect = gridContainer.getBoundingClientRect();
        const gridResizersElement = document.querySelector('.grid-resizers');
        gridResizersElement.style.left = `${gridRect.left}px`;
        gridResizersElement.style.top = `${gridRect.top}px`;
    }
    
    // Update the highlighted area
    function updateHighlightedArea() {
        // Clear any existing highlighted cells
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.style.backgroundColor = '';
            cell.textContent = ''; // Clear all numbers
        });
        
        // Highlight the cells based on current rows and columns
        const cells = document.querySelectorAll('.grid-cell');
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const index = i * 10 + j;
                if (index < cells.length) {
                    // Use a slightly more yellow color to match the reference image
                    cells[index].style.backgroundColor = 'rgba(255, 255, 200, 0.8)';
                    
                    // Add the cell number (1-based)
                    const cellNumber = i * columns + j + 1;
                    cells[index].textContent = cellNumber;
                }
            }
        }
    }
    
    // Update the result based on factors
    function updateResult() {
        const product = rows * columns;
        resultValue.textContent = product;
    }
    
    // Event Listeners for factor controls
    document.querySelector('.factor-left .up-arrow').addEventListener('click', function() {
        if (rows < 10) {
            playClickSound();
            rows++;
            updateFactors();
        }
    });
    
    document.querySelector('.factor-left .down-arrow').addEventListener('click', function() {
        if (rows > 1) {
            playClickSound();
            rows--;
            updateFactors();
        }
    });
    
    document.querySelector('.factor-right .up-arrow').addEventListener('click', function() {
        if (columns < 10) {
            playClickSound();
            columns++;
            updateFactors();
        }
    });
    
    document.querySelector('.factor-right .down-arrow').addEventListener('click', function() {
        if (columns > 1) {
            playClickSound();
            columns--;
            updateFactors();
        }
    });
    
    // Update all UI elements when factors change
    function updateFactors() {
        factorLeft.textContent = rows;
        factorRight.textContent = columns;
        horizontalDimension.textContent = columns;
        verticalDimension.textContent = rows;
        updateResult();
        updateHighlightedArea();
        
        // Update marker position
        updateCircleMarkerPosition();
    }
    
    // Create horizontal and vertical connecting lines
    function createConnectingLines() {
        // Remove existing lines if any
        const existingHLine = document.getElementById('horizontal-line');
        const existingVLine = document.getElementById('vertical-line');
        
        if (existingHLine) existingHLine.remove();
        if (existingVLine) existingVLine.remove();
        
        // Create horizontal line
        const horizontalLine = document.createElement('div');
        horizontalLine.id = 'horizontal-line';
        horizontalLine.classList.add('connecting-line', 'horizontal');
        gridContainer.appendChild(horizontalLine);
        
        // Create vertical line
        const verticalLine = document.createElement('div');
        verticalLine.id = 'vertical-line';
        verticalLine.classList.add('connecting-line', 'vertical');
        gridContainer.appendChild(verticalLine);
        
        // Update the lines position
        updateConnectingLines();
    }
    
    // Update the connecting lines
    function updateConnectingLines() {
        const horizontalLine = document.getElementById('horizontal-line');
        const verticalLine = document.getElementById('vertical-line');
        
        if (!horizontalLine || !verticalLine) return;
        
        const measurements = updateGridMeasurements();
        
        // Calculate the exact boundaries of the yellow area
        const yellowAreaWidth = columns * measurements.cellWidth;
        const yellowAreaHeight = rows * measurements.cellHeight;
        
        // Update horizontal line (bottom edge of yellow area)
        horizontalLine.style.top = `${yellowAreaHeight}px`;
        horizontalLine.style.left = `0`;
        horizontalLine.style.width = `${yellowAreaWidth}px`;
        
        // Update vertical line (right edge of yellow area)
        verticalLine.style.left = `${yellowAreaWidth}px`;
        verticalLine.style.top = `0`;
        verticalLine.style.height = `${yellowAreaHeight}px`;
    }
    
    // Grid size buttons
    document.querySelectorAll('.grid-size-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.grid-size-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
            
            let gridSize = this.textContent;
            if (gridSize === '10×10') {
                grid.style.gridTemplateColumns = 'repeat(10, 1fr)';
                grid.style.gridTemplateRows = 'repeat(10, 1fr)';
            } else if (gridSize === '12×12') {
                grid.style.gridTemplateColumns = 'repeat(12, 1fr)';
                grid.style.gridTemplateRows = 'repeat(12, 1fr)';
            }
        });
    });
    
    // Tool buttons
    document.querySelectorAll('.tool-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.tool-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
        });
    });
    
    // Partition buttons
    document.querySelectorAll('.partition-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.partition-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
        });
    });
    
    // Make marker draggable
    let isCircleDragging = false;
    const gridResizers = document.querySelector('.grid-resizers');
    
    // Initialize markers positions
    function updateGridMeasurements() {
        const gridRect = gridContainer.getBoundingClientRect();
        return {
            cellWidth: gridRect.width / 10,
            cellHeight: gridRect.height / 10,
            gridLeft: gridRect.left,
            gridTop: gridRect.top,
            gridHeight: gridRect.height
        };
    }
    
    function updateMarkerConnector(markerX, markerY) {
        const connector = document.querySelector('.marker-connector');
        if (!connector) return;
        
        const measurements = updateGridMeasurements();
        const cornerX = columns * measurements.cellWidth;
        const cornerY = rows * measurements.cellHeight;
        
        // Position at the bottom-right corner of the yellow area
        connector.style.left = `${cornerX}px`;
        connector.style.top = `${cornerY}px`;
        
        // Calculate the distance and angle between the corner and the marker
        const deltaX = markerX - cornerX;
        const deltaY = markerY - cornerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Set the width to the distance and rotate to the correct angle
        connector.style.width = `${distance}px`;
        connector.style.height = '1px';
        connector.style.transform = `rotate(${angle}deg)`;
        connector.style.display = 'block';
        connector.style.opacity = '1';
    }
    
    function updateCircleMarkerPosition() {
        const measurements = updateGridMeasurements();
        const markerRadius = 10; // 圆点半径
        
        // 确保columns和rows在有效范围内
        columns = Math.max(1, Math.min(10, columns));
        rows = Math.max(1, Math.min(10, rows));
        
        // 计算圆点应该位于的单元格
        const targetCellX = columns - 1; // 0-indexed
        const targetCellY = rows - 1; // 0-indexed
        
        // 计算当前单元格的边界（左上角和右下角坐标）
        const cellLeft = targetCellX * measurements.cellWidth;
        const cellTop = targetCellY * measurements.cellHeight;
        const cellRight = cellLeft + measurements.cellWidth;
        const cellBottom = cellTop + measurements.cellHeight;
        
        // 计算圆点位置，确保完全在目标单元格内
        // 将圆点放在单元格的右下角，但确保不超出格子
        const offsetX = Math.min(cellRight - markerRadius * 1.5, Math.max(cellLeft + markerRadius, cellRight - markerRadius * 1.5));
        const offsetY = Math.min(cellBottom - markerRadius * 1.5, Math.max(cellTop + markerRadius, cellBottom - markerRadius * 1.5));
        
        // 获取页面尺寸和方格位置信息以确保距离页面边缘的要求
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const gridContainerRect = gridContainer.getBoundingClientRect();
        
        // 计算圆点相对于页面的绝对位置
        const absoluteLeft = gridContainerRect.left + offsetX;
        const absoluteBottom = viewportHeight - (gridContainerRect.top + offsetY + markerRadius * 2);
        
        // 检查是否满足距离页面左边缘和下边缘至少80px的要求
        let adjustedOffsetX = offsetX;
        let adjustedOffsetY = offsetY;
        
        // 如果不满足左边距要求，调整X坐标
        if (absoluteLeft < 80) {
            adjustedOffsetX = offsetX + (80 - absoluteLeft);
        }
        
        // 如果不满足下边距要求，调整Y坐标
        if (absoluteBottom < 80) {
            adjustedOffsetY = offsetY - (80 - absoluteBottom);
        }
        
        // 设置圆点的位置
        circleMarker.style.position = 'absolute';
        circleMarker.style.left = `${adjustedOffsetX}px`;
        circleMarker.style.top = `${adjustedOffsetY}px`;
        
        // 更新连接线 - 连接到单元格右下角
        updateMarkerConnector(adjustedOffsetX, adjustedOffsetY);
    }
    
    // 蓝色圆点和连接线功能已禁用
    /*
    circleMarker.style.cursor = 'grab';
    
    circleMarker.addEventListener('mousedown', function(e) {
        isCircleDragging = true;
        e.preventDefault();
    });
    */
    
    // 蓝色圆点和连接线的事件处理程序已禁用
    /*
    // Handle mouse move for circle marker
    document.addEventListener('mousemove', function(e) {
        if (!isCircleDragging) return;
        
        const measurements = updateGridMeasurements();
        
        // Handle circle marker drag (for both horizontal and vertical dimensions)
        if (isCircleDragging) {
            // Get mouse position relative to grid
            const mouseX = e.clientX - measurements.gridLeft;
            const mouseY = e.clientY - measurements.gridTop;
            
            // Ensure we stay within the grid boundaries
            const totalGridWidth = measurements.cellWidth * 10;
            const totalGridHeight = measurements.cellHeight * 10;
            
            // Safety margin to ensure marker stays inside
            const safetyMargin = 5;
            
            // Hard clamp to ensure we're inside the grid boundaries
            const clampedX = Math.max(safetyMargin, Math.min(totalGridWidth - safetyMargin, mouseX));
            const clampedY = Math.max(safetyMargin, Math.min(totalGridHeight - safetyMargin, mouseY));
            
            // Calculate new dimensions based on constrained mouse position
            let newColumns = Math.max(1, Math.min(10, Math.ceil(clampedX / measurements.cellWidth)));
            let newRows = Math.max(1, Math.min(10, Math.ceil(clampedY / measurements.cellHeight)));
            
            let changed = false;
            
            if (newColumns !== columns) {
                columns = newColumns;
                changed = true;
            }
            
            if (newRows !== rows) {
                rows = newRows;
                changed = true;
            }
            
            if (changed) {
                updateFactors();
                // Force immediate update of marker position to ensure it's within bounds
                updateCircleMarkerPosition();
            }
        }
        
        // Prevent default to avoid text selection during drag
        e.preventDefault();
    });
    
    // Mouse up to end dragging
    document.addEventListener('mouseup', function() {
        isCircleDragging = false;
    });
    
    // Mouse leave to prevent drag getting stuck
    document.addEventListener('mouseleave', function() {
        isCircleDragging = false;
    });
    
    // Add touch event support for mobile devices
    circleMarker.addEventListener('touchstart', function(e) {
        isCircleDragging = true;
        e.preventDefault();
        
        // Prevent scrolling while dragging
        document.body.style.overflow = 'hidden';
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isCircleDragging) return;
        
        const measurements = updateGridMeasurements();
        const touch = e.touches[0];
        
        // Handle circle marker drag
        if (isCircleDragging) {
            // Get touch position relative to grid
            const touchX = touch.clientX - measurements.gridLeft;
            const touchY = touch.clientY - measurements.gridTop;
            
            // Ensure we stay within the grid boundaries
            const totalGridWidth = measurements.cellWidth * 10;
            const totalGridHeight = measurements.cellHeight * 10;
            
            // Safety margin to ensure marker stays inside
            const safetyMargin = 5;
            
            // Hard clamp to ensure we're inside the grid boundaries
            const clampedX = Math.max(safetyMargin, Math.min(totalGridWidth - safetyMargin, touchX));
            const clampedY = Math.max(safetyMargin, Math.min(totalGridHeight - safetyMargin, touchY));
            
            // Calculate new dimensions based on constrained touch position
            let newColumns = Math.max(1, Math.min(10, Math.ceil(clampedX / measurements.cellWidth)));
            let newRows = Math.max(1, Math.min(10, Math.ceil(clampedY / measurements.cellHeight)));
            
            let changed = false;
            
            if (newColumns !== columns) {
                columns = newColumns;
                changed = true;
            }
            
            if (newRows !== rows) {
                rows = newRows;
                changed = true;
            }
            
            if (changed) {
                updateFactors();
                // Force immediate update of marker position to ensure it's within bounds
                updateCircleMarkerPosition();
            }
        }
        
        e.preventDefault();
    });
    
    document.addEventListener('touchend', function() {
        isCircleDragging = false;
        
        // Re-enable scrolling
        document.body.style.overflow = '';
    });
    */
    
    // 添加红色圆点的拖动功能
    redDot.addEventListener('mousedown', function(e) {
        isRedDotDragging = true;
        startDragSound();
        e.preventDefault();
    });
    
    // 处理鼠标移动事件 - 拖动红色圆点
    document.addEventListener('mousemove', function(e) {
        if (!isRedDotDragging) return;
        
        const measurements = updateGridMeasurements();
        
        // 获取鼠标相对于网格的位置
        const mouseX = e.clientX - measurements.gridLeft;
        const mouseY = e.clientY - measurements.gridTop;
        
        // 确保在网格边界内
        const totalGridWidth = measurements.cellWidth * 10;
        const totalGridHeight = measurements.cellHeight * 10;
        
        // 安全边距，确保圆点始终在网格内
        const safetyMargin = 5;
        
        // 限制坐标在网格内
        const clampedX = Math.max(safetyMargin, Math.min(totalGridWidth - safetyMargin, mouseX));
        const clampedY = Math.max(safetyMargin, Math.min(totalGridHeight - safetyMargin, mouseY));
        
        // 基于鼠标位置计算新的行数和列数
        let newColumns = Math.max(1, Math.min(10, Math.ceil(clampedX / measurements.cellWidth)));
        let newRows = Math.max(1, Math.min(10, Math.ceil(clampedY / measurements.cellHeight)));
        
        let changed = false;
        
        if (newColumns !== columns) {
            columns = newColumns;
            changed = true;
        }
        
        if (newRows !== rows) {
            rows = newRows;
            changed = true;
        }
        
        if (changed) {
            // 更新所有相关元素
            updateFactors();
            // 重新定位红色圆点
            positionRedDot();
        }
        
        // 防止拖动时文本选择
        e.preventDefault();
    });
    
    // 鼠标松开结束拖动
    document.addEventListener('mouseup', function() {
        if (isRedDotDragging) {
            isRedDotDragging = false;
            stopDragSound();
        }
    });
    
    // 鼠标离开窗口时结束拖动
    document.addEventListener('mouseleave', function() {
        if (isRedDotDragging) {
            isRedDotDragging = false;
            stopDragSound();
        }
    });
    
    // 添加触摸事件支持移动设备
    redDot.addEventListener('touchstart', function(e) {
        isRedDotDragging = true;
        startDragSound();
        e.preventDefault();
        
        // 防止拖动时页面滚动
        document.body.style.overflow = 'hidden';
    });
    
    // 处理触摸移动事件
    document.addEventListener('touchmove', function(e) {
        if (!isRedDotDragging) return;
        
        const measurements = updateGridMeasurements();
        const touch = e.touches[0];
        
        // 获取触摸相对于网格的位置
        const touchX = touch.clientX - measurements.gridLeft;
        const touchY = touch.clientY - measurements.gridTop;
        
        // 计算网格总宽高
        const totalGridWidth = measurements.cellWidth * 10;
        const totalGridHeight = measurements.cellHeight * 10;
        
        // 计算拖动进度用于音效
        const progress = Math.min(1, Math.max(0, (touchX + touchY) / (totalGridWidth + totalGridHeight)));
        updateDragSound(progress);
        
        // 安全边距
        const safetyMargin = 5;
        
        // 限制坐标在网格内
        const clampedX = Math.max(safetyMargin, Math.min(totalGridWidth - safetyMargin, touchX));
        const clampedY = Math.max(safetyMargin, Math.min(totalGridHeight - safetyMargin, touchY));
        
        // 基于触摸位置计算新的行数和列数
        let newColumns = Math.max(1, Math.min(10, Math.ceil(clampedX / measurements.cellWidth)));
        let newRows = Math.max(1, Math.min(10, Math.ceil(clampedY / measurements.cellHeight)));
        
        let changed = false;
        
        if (newColumns !== columns) {
            columns = newColumns;
            changed = true;
        }
        
        if (newRows !== rows) {
            rows = newRows;
            changed = true;
        }
        
        if (changed) {
            // 更新所有相关元素
            updateFactors();
            // 重新定位红色圆点
            positionRedDot();
        }
        
        e.preventDefault();
    });
    
    // 触摸结束处理
    document.addEventListener('touchend', function() {
        isRedDotDragging = false;
        stopDragSound(); // 停止拖动音效
        
        // 恢复滚动
        document.body.style.overflow = '';
    });
    
    document.addEventListener('touchcancel', function() {
        isRedDotDragging = false;
        stopDragSound(); // 停止拖动音效
        
        // 恢复滚动
        document.body.style.overflow = '';
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // 更新位置（已移除圆点和连接线的更新）
        // updateCircleMarkerPosition();
        updateConnectingLines();
        
        // 窗口大小变化时重新定位红色圆点
        positionRedDot();
    });
    
    // Add eraser functionality to reset to initial state
    eraserTool.addEventListener('click', function() {
        // Reset to initial state (1x1)
        playEraseSound();
        rows = 1;
        columns = 1;
        updateFactors();
        // Reset red dot position
        positionRedDot();
    });
    
    // Add grid toggle functionality
    gridIcon.addEventListener('click', function() {
        playToggleSound();
        gridVisible = !gridVisible;
        
        // Toggle grid cell borders
        const gridCells = document.querySelectorAll('.grid-cell');
        gridCells.forEach(cell => {
            if (gridVisible) {
                cell.style.border = '1px solid #ddd';
            } else {
                cell.style.border = 'none';
            }
        });
    });
    
    // 定位红色圆点到当前黄色区域的右下角的函数
    function positionRedDot() {
        const redDot = document.querySelector('.red-dot');
        const measurements = updateGridMeasurements();
        
        // 计算单元格的宽高
        const cellWidth = measurements.cellWidth;
        const cellHeight = measurements.cellHeight;
        
        // 获取红色圆点的实际尺寸
        const dotStyle = window.getComputedStyle(redDot);
        const dotWidth = parseFloat(dotStyle.width) || 15;
        const dotHeight = parseFloat(dotStyle.height) || 15;
        
        // 计算当前黄色区域的右下角坐标
        const areaRightX = columns * cellWidth;
        const areaBottomY = rows * cellHeight;
        
        // 设置偏移量以确保圆点始终位于方格内部
        const dotOffset = dotWidth * 0.75; // 偏移量的计算采用圆点直径的75%
        
        // 精确定位到当前黄色区域的右下角
        redDot.style.left = `${areaRightX - dotOffset}px`;
        redDot.style.top = `${areaBottomY - dotOffset}px`;
        
        // 确保圆点始终保持可见
        redDot.style.display = 'block';
    }
    
    // 初始化网格
    // updateCircleMarkerPosition(); // 已移除蓝色圆点的初始化
    
    // Initialize the grid on load
    initializeGrid();
    
    // 定位红色圆点到左上角方格右下角
    positionRedDot();
});