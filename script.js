$(document).ready(function () {
    const dropArea = document.getElementById("dropArea");
    const inputFile = document.getElementById("inputFile");
    const imageView = document.getElementById("imageView");
    const backgroundImage = document.getElementById("backgroundImage");
    const toggleButton = document.getElementById("toggleButton");
    const gridToggleButton = document.getElementById("gridToggleButton");
    const horizontalGridToggleButton = document.getElementById("horizontalGridToggleButton");
    const verticalGridToggleButton = document.getElementById("verticalGridToggleButton");
    const reCenterToggleButton = document.getElementById("reCenterToggleButton");
    
    const container = document.getElementById('verticalLineDiv');

    let lineCount = 0; // Default number of horizontal lines
    let spacingPixels = 0; // Adjust this value as needed

    container.style.display = "none";
    
    let totalImageViewWidth = 0;
    let widthMinusLines = 0;
    let imgWidth = 0;
    let imgHeight = 0;
    let vertLineNum = 3;
    let scaleFactor = 1;
    let isDragging = false;
    let initialX;
    let initialY;
    let offsetX = 0;
    let offsetY = 0;
    let manualMoveEnabled = false;
    let showGrid = false;
    let showHzLines = false;
    let showVertLines = false;

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

    //gets the width of the 'imageView' div, which holds the imageyy
    function getImageViewWidth(imageView){
        totalImageViewWidth = Number(imageView.offsetWidth);
        console.log("Image View width = " + totalImageViewWidth);    
        return totalImageViewWidth;
    }       
    getImageViewWidth(imageView);

    function uploadImage(file) {
        let imgLink = URL.createObjectURL(file);
        backgroundImage.style.backgroundImage = `url(${imgLink})`;
    }

    inputFile.addEventListener("change", function () {
        if (this.files.length > 0) {
            uploadImage(this.files[0]);
        }
    });

    // changes the size of the image
    function updateBackgroundScale(scale) {
        scaleFactor = scale;
        let translateX = offsetX - (backgroundImage.offsetWidth / 2);
        let translateY = offsetY - (backgroundImage.offsetHeight / 2);
        backgroundImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    // listens for the scale slider 
    $("#scaleSlider").on("input", function () {
        let scale = $(this).val();
        console.log("current scale = " + scale);
        updateBackgroundScale(scale);
    });

    // updates the grid lines when the slider is changed
    $("#gridLineScaleSlider").on("input", function () {
        vertLineNum = $(this).val();
        lineCount = vertLineNum*3; // *3 makes sure there are always enough horizontal grid lines (unless the image is ridiculously distorted)
        console.log("vertLineNum = " + vertLineNum);
        console.log("Container width = " + container.offsetWidth + " px");
        container.innerHTML = ''; // Clear existing lines    
                    
        spacingPixels = totalImageViewWidth / (vertLineNum-1) // have to -1 to get the correct scale e.g. make all the division cubes
        console.log("line spacing in PX = " + spacingPixels);

        createParallelLines(container, vertLineNum); // Recreate lines
        if(!showHzLines) { createHzParallelLines(container, lineCount, spacingPixels); };
    });

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

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    });

    function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
    }

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

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;

        if (files.length > 0) {
            uploadImage(files[0]);
        }
    }

    toggleButton.addEventListener("click", function () {
        manualMoveEnabled = !manualMoveEnabled;
        toggleButton.textContent = manualMoveEnabled ? "Disable Manual Move" : "Enable Manual Move";

        if (manualMoveEnabled) {
            inputFile.removeAttribute("id");
        } else {
            inputFile.setAttribute("id", "inputFile");
        }
    });

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

    // this function redraws the lines when the grid is re-sized
    function updateGrid(container) {
        container.innerHTML = ''; // Clear existing lines
    
        createParallelLines(container, vertLineNum); // Recreate lines
        measureLineSpace(container, vertLineNum)
    }
    updateGrid(container);

    function measureLineSpace(container, vertLineNum){
        getImageViewWidth(imageView); // updates the totalImageView width global variable. 
        spacingPixels = totalImageViewWidth / (vertLineNum-1) // have to -1 to get the correct scale e.g. make all the division cubes
        if (!showHzLines) {createHzParallelLines(container, lineCount, spacingPixels);} //calls this function with updated spacing pixels IF showHzLines bool is true. 
    }

    window.addEventListener('resize', function () {
        updateGrid(container);
    });

    function createVerticalLine(container, offsetPercentage) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.left = offsetPercentage + '%'; // Use percentage-based offset              
        container.appendChild(line);
    }

    function createParallelLines(container, count) {
        const spacingPercentage = 100 / (count - 1); // Calculate percentage-based spacing
        for (let i = 0; i < count; i++) {
            createVerticalLine(container, i * spacingPercentage);
            console.log("createParallelLines func called");
        }
    };

    function createHorizontalLine(container, offsetPixels) {
        const hzLine = document.createElement('div');
        hzLine.classList.add('horizontalLine');
        hzLine.style.position = 'absolute'; // Ensure position is absolute
        hzLine.style.top = offsetPixels + 'px'; // Use pixel-based offset
        container.appendChild(hzLine);
    }

    function createHzParallelLines(container, count, spacingPixels) {
        const containerHeight = imageView.clientHeight; // Get the container height
        const centerOffset = containerHeight / 2; // Calculate the center position

        // Calculate the initial offset for the first line to be at the center
        const initialOffset = centerOffset;

        // Create the central line
        createHorizontalLine(container, initialOffset);

        // Create lines above the central line
        for (let i = 1; i < Math.ceil(count / 2); i++) {
            createHorizontalLine(container, initialOffset - i * spacingPixels);
        }

        // Create lines below the central line
        for (let i = 1; i < Math.floor(count / 2); i++) {
            createHorizontalLine(container, initialOffset + i * spacingPixels);
        }
    }

    //clear all lines and redraw only vertical lines. 
    horizontalGridToggleButton.addEventListener("click", function () {

        showHzLines = !showHzLines;
        console.log("showHzLine = " + !showHzLines);
        horizontalGridToggleButton.textContent = !showHzLines ? "Hide Hz Grid" : "Show Hz Grid";
        // const grid = document.getElementById("verticalLineDiv");
        if (showHzLines) {
            container.innerHTML = ''; // Clear existing lines
            console.log("Hide Hz Grid Lines");
            createParallelLines(container,vertLineNum);
        } else {
            console.log("Show Hz Grid Lines");
            createHzParallelLines(container,vertLineNum*3,spacingPixels);
        };
    });

    verticalGridToggleButton.addEventListener("click", function () {

        showVertLines = !showVertLines;
        verticalGridToggleButton.textContent = !showVertLines? "Hide Vert Grid" : "Show Vert Grid"
        // container.innerHTML = '';
        // need to set CSS line width to zero px. 
        // call the draw lines functions
        console.log("verticalGridToggleButton has been clicked! woo!");

        // do the reverse of this. 

    });


    let currentScaleFactor = 1;

    function clearManipulations() {
        backgroundImage.style.backgroundPosition = "";
        backgroundImage.style.transform = "";

        offsetX = 0;
        offsetY = 0;

        console.log("JavaScript manipulations cleared.");
    }

    reCenterToggleButton.addEventListener("click", function () {
        currentScaleFactor = scaleFactor;

        clearManipulations();

        backgroundImage.style.backgroundPosition = "center center";
        console.log("Image re-centered.");
    });

    function reapplyScaleFactor() {
        let translateX = offsetX - (backgroundImage.offsetWidth / 2);
        let translateY = offsetY - (backgroundImage.offsetHeight / 2);
        backgroundImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScaleFactor})`;
    }

    reCenterToggleButton.addEventListener("click", function () {
        reapplyScaleFactor();
    });
});
