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
        grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // Create grid cells
        for (let i = 0; i < rows * columns; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            grid.appendChild(cell);
        }
        
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
    }
    
    // Update the highlighted area
    function updateHighlightedArea() {
        grid.style.setProperty('--highlight-width', `${(columns / 10) * 100}%`);
        grid.style.setProperty('--highlight-height', `${(rows / 10) * 100}%`);
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
            gridBottom: gridRect.bottom
        };
    }
    
    function updateCircleMarkerPosition() {
        const measurements = updateGridMeasurements();
        const offsetX = columns * measurements.cellWidth;
        circleMarker.style.position = 'absolute';
        circleMarker.style.left = `${offsetX}px`;
    }
    
    function updateTriangleMarkerPosition() {
        // Triangle marker should stay in place as it's part of the layout
        // This function is added for completeness
    }
    
    // Make triangle marker draggable (horizontal movement)
    triangleMarker.style.cursor = 'grab';
    
    triangleMarker.addEventListener('mousedown', function(e) {
        isTriangleDragging = true;
        e.preventDefault();
    });
    
    // Make circle marker draggable (vertical movement)
    circleMarker.addEventListener('mousedown', function(e) {
        isCircleDragging = true;
        e.preventDefault();
    });
    
    // Handle mouse move for both markers
    document.addEventListener('mousemove', function(e) {
        const measurements = updateGridMeasurements();
        
        // Handle circle marker drag (for horizontal dimension)
        if (isCircleDragging) {
            const mouseX = e.clientX - measurements.gridLeft;
            let newColumns = Math.max(1, Math.min(10, Math.round(mouseX / measurements.cellWidth)));
            
            if (newColumns !== columns) {
                columns = newColumns;
                updateFactors();
            }
        }
        
        // Handle triangle marker drag (for vertical dimension)
        if (isTriangleDragging) {
            // Calculate vertical position based on mouse position relative to grid bottom
            const mouseY = measurements.gridBottom - e.clientY;
            let newRows = Math.max(1, Math.min(10, Math.round(mouseY / measurements.cellHeight)));
            
            if (newRows !== rows) {
                rows = newRows;
                updateFactors();
            }
        }
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
    
    // Initialize the grid on load
    initializeGrid();
}); 