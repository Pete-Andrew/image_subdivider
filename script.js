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
    const pauseButton = document.getElementById('pause-button');
    const cameraOnButton = document.getElementById('cameraOnButton');
    const container = document.getElementById('verticalLineDiv');
    const fineSizeUpButton = document.getElementById('fineSizeUp');
    const fineSizeDownButton = document.getElementById('fineSizeDown');



    let lineCount = 0; // Default number of horizontal lines
    let spacingPixels = 0; // Adjust this value as needed

    container.style.display = "none";

    let totalImageViewWidth = 0;
    let widthMinusLines = 0;
    let imgWidth = 0;
    let imgHeight = 0;
    let vertLineNum = 3;
    let scale = 1;
    let scaleFactor = 1;
    let currentScaleFactor = 1;

    let isDragging = false;
    let initialX;
    let initialY;
    let offsetX = 0;
    let offsetY = 0;
    let manualMoveEnabled = false;
    let showGrid = false;
    let showHzLines = false;
    let showVertLines = true;
    let currentFacingMode = 'user'; // Default to front camera
    let paused = false;
    let cameraOn = false;

    function getSize() {
        $("#inputFile").change(function (e) {
            var file, img;

            if ((file = this.files[0])) {
                img = new Image();

                img.onload = function () {

                    imgWidth = this.width;
                    imgHeight = this.height;
                    // logs out the size of the imported im in px
                    console.log("raw imported Width of img (imgWidth) in px = " + imgWidth);
                    console.log("raw imported Height of img (imgHeight) in px = " + imgHeight);
                };

                img.onerror = function () {
                    alert("not a valid file: " + file.type);
                };

                // Log the name of the uploaded file
                console.log("Name of the uploaded image: " + file.name);

                img.src = URL.createObjectURL(file);
            }
        });
    };

    getSize();

    //button to set the grid lines to the size of the image rather than the container... 
    //be able to move the image up/sideways with sliders 
    //save image/location/scaling info in local data
    //

    //gets the width of the 'imageView' div, which holds the image
    function getImageViewWidth(imageView) {
        totalImageViewWidth = Number(imageView.offsetWidth);
        console.log("Image View width = " + totalImageViewWidth);
        return totalImageViewWidth;
    }
    // getImageViewWidth(imageView); //doesn't need to be called here as it is also called in the measure line spaces function

    // uploads the image as either a drag and drop or an open file
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
        console.log("scale = " + scale);
    }

    // listens for the scale slider 
    $("#scaleSlider").on("input", function () {
        scale = parseFloat($(this).val());  //parseFloat enables the fine size buttons to work if the image has been re-scaled with the slider
        console.log("current scale = " + scale);
        updateBackgroundScale(scale);
    });
    

    fineSizeUpButton.addEventListener('click', function () {
        scale += 0.05;
        //needs to update the scale slider value
        //needs to set a max of 2 for scale and a min of 0.1
        updateBackgroundScale(scale);
    });

    fineSizeDownButton.addEventListener('click', function () {
        scale -= 0.05;
        //needs to update the scale slider value
        //needs to set a max of 2 for scale and a min of 0.1
        updateBackgroundScale(scale);
    });


    // updates the grid lines when the slider is changed
    $("#gridLineScaleSlider").on("input", function () {
        vertLineNum = $(this).val();
        lineCount = vertLineNum * 3; // *3 makes sure there are always enough horizontal grid lines (unless the image is ridiculously distorted)
        console.log("vertLineNum = " + vertLineNum);
        console.log("Container width = " + container.offsetWidth + " px");
        container.innerHTML = ''; // Clear existing lines    

        spacingPixels = totalImageViewWidth / (vertLineNum - 1) // have to -1 to get the correct scale e.g. make all the division cubes
        console.log("line spacing in PX = " + spacingPixels);

        createParallelLines(container, vertLineNum); // Recreate lines
        if (!showHzLines) { createHzParallelLines(container, lineCount, spacingPixels); };
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

    // the manual move button to let you reposition the image
    toggleButton.addEventListener("click", function () {
        manualMoveEnabled = !manualMoveEnabled;
        toggleButton.textContent = manualMoveEnabled ? "Disable Manual Move" : "Enable Manual Move";

        if (manualMoveEnabled) {
            inputFile.removeAttribute("id");
        } else {
            inputFile.setAttribute("id", "inputFile");
        }
    });

    // toggles the grid on and off
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


    function measureLineSpace(container, vertLineNum) {
        getImageViewWidth(imageView); // updates the totalImageView width global variable. 
        spacingPixels = totalImageViewWidth / (vertLineNum - 1) // have to -1 to get the correct scale e.g. make all the division cubes
        if (!showHzLines) { createHzParallelLines(container, lineCount, spacingPixels); } //calls this function with updated spacing pixels IF showHzLines bool is true. 
    }

    //resizes the grid if the window size is changed
    window.addEventListener('resize', function () {
        updateGrid(container);
    });

    // functions for creating the lines
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
            // console.log("createParallelLines func called");
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
            createParallelLines(container, vertLineNum);
        } else {
            console.log("Show Hz Grid Lines");
            createHzParallelLines(container, vertLineNum * 3, spacingPixels);
        };
    });

    verticalGridToggleButton.addEventListener("click", function () {

        // showVertLines = true;
        verticalGridToggleButton.textContent = showVertLines ? "Hide Vert Grid" : "Show Vert Grid"

        if (showVertLines == true) {
            container.innerHTML = '';
            var styleSheet = document.styleSheets[0];
            styleSheet.insertRule('.line { width: 0px !important; }', styleSheet.cssRules.length);
            createParallelLines(container, vertLineNum); // Recreate lines
            if (!showHzLines) { createHzParallelLines(container, lineCount, spacingPixels); };
            console.log("hide vert grid lines has been clicked! woo!");
            showVertLines = !showVertLines;
            console.log(showVertLines);

        } else {
            var styleSheet = document.styleSheets[0];
            styleSheet.insertRule('.line { width: 1px !important; }', styleSheet.cssRules.length);
            createParallelLines(container, vertLineNum); // Recreate lines
            if (!showHzLines) { createHzParallelLines(container, lineCount, spacingPixels); };
            console.log("verticalGridToggleButton has been clicked! woo!");
            showVertLines = true;
        }


        // Loop through each element and set its width to 10px
        // for (var i = 0; i < elements.length; i++) {
        // elements[i].style.width = "4px";
        // }


    });

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

    // functions for the camera

    async function startCamera(facingMode) {
        paused = false;
        pauseButton.textContent = "Pause";

        const video = document.getElementById('camera-feed');

        // Stop any existing video stream
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        try {
            // Request access to the camera with the specified facingMode
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode },
                audio: false
            });

            // Set the video element's srcObject to the camera stream
            video.srcObject = stream;

            // Play the video
            video.onloadedmetadata = () => {
                video.play();
            };
        } catch (err) {
            console.error("Error accessing the camera: ", err);
            if (err.name === 'OverconstrainedError') {
                console.error(`The requested facingMode: ${facingMode} is not available.`);
            }
        }
    }

    // section of code that targets live camera feed
    document.getElementById('toggle-camera-button').addEventListener('click', () => {
        // Toggle the facing mode
        currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        startCamera(currentFacingMode);
    });

    // pause button for the camera feed
    pauseButton.addEventListener('click', () => {

        pauseButton.textContent = paused ? "Pause" : "Play";
        if (paused == false) {
            paused = true;
            const video = document.getElementById('camera-feed');
            video.pause()
            console.log("video paused");

        } else {
            paused = false;
            startCamera(currentFacingMode);
            console.log("video un-paused");
        }

    });

    // Start with the default camera
    cameraOnButton.addEventListener('click', () => {
        cameraOnButton.textContent = cameraOn ? "Camera Off" : "Camera On";
        startCamera(currentFacingMode);
    })



});
