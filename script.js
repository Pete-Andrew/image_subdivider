$(document).ready(function () {
    const dropArea = document.getElementById("dropArea");
    const inputFile = document.getElementById("inputFile");
    const imageView = document.getElementById("imageView");
    const backgroundImage = document.getElementById("backgroundImage");
    const toggleButton = document.getElementById("toggleButton");
    const gridToggleButton = document.getElementById("gridToggleButton");
    const horizontalGridToggleButton = document.getElementById("horizontalGridToggleButton");
    // const verticalLine = document.getElementById("verticalLine");
    // const imageViewWidth = document.getElementById("imageView").offsetWidth;
    const reCenterToggleButton = document.getElementById("reCenterToggleButton");
    
    const container = document.getElementById('verticalLineDiv');

    container.style.display = "none";
    

    let imgWidth = 0;
    let imgHeight = 0;
    let vertLineNum = 7;
    let scaleFactor = 1;
    let isDragging = false;
    let initialX;
    let initialY;
    let offsetX = 0;
    let offsetY = 0;
    let manualMoveEnabled = false;
    // let clickHereToUpload = true;
    let showGrid = true;

    // Get the size of the input image
    function getSize() {
        $("#inputFile").change(function (e) {
            var file, img;

            if ((file = this.files[0])) {
                img = new Image();

                img.onload = function () {
                    imgWidth = this.width;
                    imgHeight = this.height;
                };

                img.onerror = function () {
                    alert("not a valid file: " + file.type);
                };

                img.src = URL.createObjectURL(file);
            }
        });
    };

    getSize();

    // this function gets the full width of the main container (called imageView), will be used to get the spacing between vertical lines to define horizontal spacing
    function getImageViewWidth(imageView){
        const imageViewWidth = imageView.offsetWidth;
        console.log("Image View width = " + imageViewWidth);
        // return imageViewWidth;
    }       
    getImageViewWidth(imageView);

    // Function to handle image upload
    function uploadImage(file) {
        let imgLink = URL.createObjectURL(file);
        backgroundImage.style.backgroundImage = `url(${imgLink})`;
    }

    // Event listener for file input change
    inputFile.addEventListener("change", function () {
        if (this.files.length > 0) {
            uploadImage(this.files[0]);
        }
    });

    // Function to update background image scale
    function updateBackgroundScale(scale) {
        scaleFactor = scale;
        let translateX = offsetX - (backgroundImage.offsetWidth / 2);
        let translateY = offsetY - (backgroundImage.offsetHeight / 2);
        backgroundImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    // Event listener for scale slider change
    $("#scaleSlider").on("input", function () {
        let scale = $(this).val();
        console.log("current scale = " + scale);
        updateBackgroundScale(scale);
    });

    // Event listener for number of grid lines slider change
    $("#gridLineScaleSlider").on("input", function () {
        vertLineNum = $(this).val();
        console.log("vertLineNum = " + vertLineNum);
        container.innerHTML = ''; // Clear existing lines
        createParallelLines(container, vertLineNum); // Recreate lines
    });


    // Event listeners for mouse events to enable dragging
    imageView.addEventListener("mousedown", startDragging);
    imageView.addEventListener("mousemove", drag);
    imageView.addEventListener("mouseup", endDragging);
    imageView.addEventListener("mouseleave", endDragging);

    function startDragging(e) {
        if (manualMoveEnabled) {
            isDragging = true;
            initialX = e.clientX - offsetX;
            initialY = e.clientY - offsetY;
        }
    }

    function drag(e) {
        if (manualMoveEnabled && isDragging) {
            offsetX = e.clientX - initialX;
            offsetY = e.clientY - initialY;
            updateBackgroundScale(scaleFactor);
        }
    }

    function endDragging() {
        isDragging = false;
    }

    // Prevent default behavior for drag-and-drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    });

    function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
    }

    // Highlight drop area when a file is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false)
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    });

    function highlight(e) {
        dropArea.classList.add('highlight')
    }

    function unhighlight(e) {
        dropArea.classList.remove('highlight')
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;

        if (files.length > 0) {
            uploadImage(files[0]);
        }
    }

    // Move image Toggle button event listener
    toggleButton.addEventListener("click", function () {
        manualMoveEnabled = !manualMoveEnabled;
        toggleButton.textContent = manualMoveEnabled ? "Disable Manual Move" : "Enable Manual Move";

        // Toggle association between label and input file
        if (manualMoveEnabled) {
            inputFile.removeAttribute("id");
        } else {
            inputFile.setAttribute("id", "inputFile");
        }
    });

    //Making the grid! 
    //Show vertical grid toggle 
    gridToggleButton.addEventListener("click", function () {
        showGrid = !showGrid;
        gridToggleButton.textContent = showGrid ? "Hide Grid" : "Show Grid";
        const grid = document.getElementById("verticalLineDiv");

        if (grid.style.display == "block") {
            grid.style.display = "none";
        } else {
            grid.style.display = "block";
        };
    });

    // Function to update the vertical grid lines based on container width
    function updateGrid(container) {
        container.innerHTML = ''; // Clear existing lines
        createParallelLines(container, vertLineNum); // Recreate lines
    }

    // Call the updateGrid function initially
    updateGrid(container);

    // Listen for window resize event to update the grid lines
    window.addEventListener('resize', function () {
        updateGrid(container);

        // Additionally, update the position of the vertical line if needed
        // verticalLine.style.left = `${imageViewWidth / 2}px`;
    });

    // Function to create a vertical line in the container
    function createVerticalLine(container, offsetPercentage) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.left = offsetPercentage + '%'; // Use percentage-based offset
        
        container.appendChild(line);
    }

    // Function to create vertical parallel lines with regular offset
    function createParallelLines(container, count) {
        const spacingPercentage = 100 / (count - 1); // Calculate percentage-based spacing
        for (let i = 0; i < count; i++) {
            createVerticalLine(container, i * spacingPercentage);
        }
    }

  
    // Function to create a HORIZONTAL lines in the container
    function createHorizontalLine(container, offsetPercentage) {
        const hzLine = document.createElement('div');
        hzLine.classList.add('horizontalLine');
        hzLine.style.top = offsetPercentage + '%'; // Use percentage-based offset
        container.appendChild(hzLine);
    }

    // Function to create HORIZONTAL parallel lines with regular offset
    function createHzParallelLines(container, count) {
        const spacingPercentage = 100 / (count - 1); // Calculate percentage-based spacing
        for (let i = 0; i < count; i++) {
            createHorizontalLine(container, i * spacingPercentage);
        }
    }

    createHzParallelLines(container, 7);

    // recenter the image 
    // Initialize it with the default scale factor
    let currentScaleFactor = 1;

    // Function to clear manipulations
    function clearManipulations() {
        // Reset any styles applied to the image
        backgroundImage.style.backgroundPosition = "";
        backgroundImage.style.transform = "";

        // Reset any variables used for manipulation
        offsetX = 0;
        offsetY = 0;

        // Log a message to confirm that manipulations have been cleared
        console.log("JavaScript manipulations cleared.");
    }

    // Event listener for reCenterToggleButton
    reCenterToggleButton.addEventListener("click", function () {
        // Store the current scale factor
        currentScaleFactor = scaleFactor;

        // Clear JavaScript manipulations
        clearManipulations();

        // Re-center the image
        backgroundImage.style.backgroundPosition = "center center";
        console.log("Image re-centered.");
    });

    // Function to reapply scale factor after re-centering
    function reapplyScaleFactor() {
        // Reapply the stored scale factor
        let translateX = offsetX - (backgroundImage.offsetWidth / 2);
        let translateY = offsetY - (backgroundImage.offsetHeight / 2);
        backgroundImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScaleFactor})`;
    }

    // Update the scale after re-centering
    reCenterToggleButton.addEventListener("click", function () {
        reapplyScaleFactor();
    });

    // horizontal grid lines

    // need to create a horizontal grid line in the middle of the div
    // need to have the same distance apart as the vertical grid lines so that the grid lines always form a cube lattice




    //grid line thickness






});
