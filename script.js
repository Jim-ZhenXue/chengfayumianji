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
    const triangleMarker = document.querySelector('.triangle-marker');

    // Current state
    let rows = 7;
    let columns = 2;
    
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
        });
        
        // Highlight the cells based on current rows and columns
        const cells = document.querySelectorAll('.grid-cell');
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const index = i * 10 + j;
                if (index < cells.length) {
                    // Use a slightly more yellow color to match the reference image
                    cells[index].style.backgroundColor = 'rgba(255, 255, 200, 0.8)';
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
    
    // Handle resizing through arrow buttons
    document.querySelector('.arrow-left').addEventListener('click', function() {
        if (columns > 1) {
            columns--;
            updateFactors();
        }
    });
    
    document.querySelector('.arrow-right').addEventListener('click', function() {
        if (columns < 10) {
            columns++;
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
        
        // Update markers positions
        updateCircleMarkerPosition();
        updateTriangleMarkerPosition();
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
        const circleX = columns * measurements.cellWidth;
        const circleY = rows * measurements.cellHeight;
        
        // Get the grid position
        const gridRect = grid.getBoundingClientRect();
        
        // Update horizontal line (from left edge to circle)
        horizontalLine.style.top = `${circleY}px`;
        horizontalLine.style.left = `0`;
        horizontalLine.style.width = `${circleX}px`;
        
        // Update vertical line (from top edge to circle)
        verticalLine.style.left = `${circleX}px`;
        verticalLine.style.top = `0`;
        verticalLine.style.height = `${circleY}px`;
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
    
    // Make markers draggable
    let isCircleDragging = false;
    let isTriangleDragging = false;
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
    
    function updateCircleMarkerPosition() {
        const measurements = updateGridMeasurements();
        const offsetX = columns * measurements.cellWidth;
        const offsetY = rows * measurements.cellHeight;
        
        // Position the circle at the bottom-right corner of the highlighted area
        // Exactly at the grid intersection point, no offset
        circleMarker.style.position = 'absolute';
        circleMarker.style.left = `${offsetX}px`;
        circleMarker.style.top = `${offsetY}px`;
        
        // Apply a transform to center the circle on the grid intersection
        circleMarker.style.transform = 'translate(-50%, -50%)';
        
        // Update the connecting lines
        updateConnectingLines();
    }
    
    function updateTriangleMarkerPosition() {
        // Update triangle marker position to match the grid layout
        const measurements = updateGridMeasurements();
        triangleMarker.style.position = 'absolute';
        triangleMarker.style.left = `${columns * measurements.cellWidth / 2}px`;
        triangleMarker.style.bottom = '-20px';
        
        // Reset any transform that might have been applied
        triangleMarker.style.transform = '';
    }
    
    // Make triangle marker draggable (horizontal movement)
    triangleMarker.style.cursor = 'grab';
    
    triangleMarker.addEventListener('mousedown', function(e) {
        isTriangleDragging = true;
        e.preventDefault();
    });
    
    // Make circle marker draggable (vertical movement)
    circleMarker.style.cursor = 'grab';
    
    circleMarker.addEventListener('mousedown', function(e) {
        isCircleDragging = true;
        e.preventDefault();
    });
    
    // Handle mouse move for both markers
    document.addEventListener('mousemove', function(e) {
        if (!isCircleDragging && !isTriangleDragging) return;
        
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
        
        // Handle triangle marker drag (for horizontal dimension only)
        if (isTriangleDragging) {
            // Calculate horizontal position based on mouse position relative to grid left
            const mouseX = e.clientX - measurements.gridLeft;
            let newColumns = Math.max(1, Math.min(10, Math.round(mouseX / measurements.cellWidth)));
            
            if (newColumns !== columns) {
                columns = newColumns;
                updateFactors();
            }
        }
        
        // Prevent default to avoid text selection during drag
        e.preventDefault();
    });
    
    // Mouse up to end dragging
    document.addEventListener('mouseup', function() {
        isCircleDragging = false;
        isTriangleDragging = false;
    });
    
    // Mouse leave to prevent drag getting stuck
    document.addEventListener('mouseleave', function() {
        isCircleDragging = false;
        isTriangleDragging = false;
    });
    
    // Initialize positions
    updateCircleMarkerPosition();
    updateTriangleMarkerPosition();
    
    // Initialize the grid on load
    initializeGrid();
}); 