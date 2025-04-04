document.addEventListener('DOMContentLoaded', function() {
    // Grid initialization
    const grid = document.querySelector('.grid');
    const gridContainer = document.querySelector('.grid-container');
    const factorLeft = document.querySelector('.factor-left .factor-value');
    const factorRight = document.querySelector('.factor-right .factor-value');
    const resultValue = document.querySelector('.result-value');
    const horizontalDimension = document.querySelector('.dimension-display.horizontal .dimension-value');
    const verticalDimension = document.querySelector('.dimension-display.vertical .dimension-value');
    const circleMarker = document.querySelector('.circle-marker');
    const eraserTool = document.querySelector('.eraser-tool');
    const gridIcon = document.querySelector('.grid-icon');

    // Current state
    let rows = 1;
    let columns = 1;
    let gridVisible = true;
    
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
            rows++;
            updateFactors();
        }
    });
    
    document.querySelector('.factor-left .down-arrow').addEventListener('click', function() {
        if (rows > 1) {
            rows--;
            updateFactors();
        }
    });
    
    document.querySelector('.factor-right .up-arrow').addEventListener('click', function() {
        if (columns < 10) {
            columns++;
            updateFactors();
        }
    });
    
    document.querySelector('.factor-right .down-arrow').addEventListener('click', function() {
        if (columns > 1) {
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
        // Find the grid cell containing the maximum number
        const gridCells = document.querySelectorAll('.grid-cell');
        let maxCell = null;
        let maxVal = -Infinity;
        gridCells.forEach(cell => {
            const text = cell.innerText.trim();
            const val = parseFloat(text);
            if (!isNaN(val) && val > maxVal) {
                maxVal = val;
                maxCell = cell;
            }
        });
        if (!maxCell) return;
        
        // Compute the center of the maxCell relative to the grid container
        const containerRect = gridContainer.getBoundingClientRect();
        const cellRect = maxCell.getBoundingClientRect();
        const offsetX = cellRect.left - containerRect.left + cellRect.width / 2;
        const offsetY = cellRect.top - containerRect.top + cellRect.height / 2;
        
        circleMarker.style.position = 'absolute';
        circleMarker.style.left = `${offsetX}px`;
        circleMarker.style.top = `${offsetY}px`;
        
        // Update the marker connector to link with the center of the max cell
        updateMarkerConnector(offsetX, offsetY);
    }
    
    // Make circle marker draggable (vertical movement)
    circleMarker.style.cursor = 'grab';
    
    circleMarker.addEventListener('mousedown', function(e) {
        isCircleDragging = true;
        e.preventDefault();
    });
    
    // Handle mouse move for circle marker
    document.addEventListener('mousemove', function(e) {
        if (!isCircleDragging) return;
        
        const measurements = updateGridMeasurements();
        
        // Handle circle marker drag (for both horizontal and vertical dimensions)
        if (isCircleDragging) {
            // Get mouse position relative to grid
            const mouseX = e.clientX - measurements.gridLeft;
            const mouseY = e.clientY - measurements.gridTop;
            
            // Calculate new dimensions based on mouse position
            // Constrain to grid boundaries (1-10)
            let newColumns = Math.max(1, Math.min(10, Math.round(mouseX / measurements.cellWidth)));
            let newRows = Math.max(1, Math.min(10, Math.round(mouseY / measurements.cellHeight)));
            
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
            
            // Calculate new dimensions based on touch position
            let newColumns = Math.max(1, Math.min(10, Math.round(touchX / measurements.cellWidth)));
            let newRows = Math.max(1, Math.min(10, Math.round(touchY / measurements.cellHeight)));
            
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
            }
        }
        
        e.preventDefault();
    });
    
    document.addEventListener('touchend', function() {
        isCircleDragging = false;
        
        // Re-enable scrolling
        document.body.style.overflow = '';
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Update positions
        updateCircleMarkerPosition();
        updateConnectingLines();
    });
    
    // Add eraser functionality to reset to initial state
    eraserTool.addEventListener('click', function() {
        // Reset to initial state (1x1)
        rows = 1;
        columns = 1;
        updateFactors();
    });
    
    // Add grid toggle functionality
    gridIcon.addEventListener('click', function() {
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
    
    // Initialize positions
    updateCircleMarkerPosition();
    
    // Initialize the grid on load
    initializeGrid();
}); 