$(document).ready(function () {
    const dropArea = document.getElementById("dropArea");
    const inputFile = document.getElementById("inputFile");
    const imageView = document.getElementById("imageView");
    const backgroundImage = document.getElementById("backgroundImage");
    const toggleButton = document.getElementById("toggleButton");
    const gridToggleButton = document.getElementById("gridToggleButton");
    const verticalLine = document.getElementById("verticalLine");
    const imageViewWidth = document.getElementById("imageView").offsetWidth;
    const reCenterToggleButton = document.getElementById("reCenterToggleButton");
    

    let imgWidth = 0;
    let imgHeight = 0;
    let scaleFactor = 1;
    let isDragging = false;
    let initialX;
    let initialY;
    let offsetX = 0;
    let offsetY = 0;
    let manualMoveEnabled = false;
    let clickHereToUpload = true;
    let showGrid = true;

    // Get the size of the input image
    function getSize() {
        //uses jquery to get the inputFile ID and calls the following function on change event, $("#inputFile") is a jquery selector that selects a HTML element 
        $("#inputFile").change(function (e) {
            var file, img;

            if ((file = this.files[0])) {
                img = new Image();

                //logs the size of the imported image into the console. 
                img.onload = function () {

                    imgWidth = this.width;
                    console.log("original Width = " + imgWidth);
                    imgHeight = this.height;
                    console.log("original Height = " + imgHeight);
                    // gets the absolute value of the 'backgroundImage' div that is created when an image is imported.    
                    console.log(document.getElementById('backgroundImage').offsetWidth);

                };

                //throws an error if the file is not an image
                img.onerror = function () {
                    alert("not a valid file: " + file.type);
                };

                img.src = URL.createObjectURL(file);
            }
        });
    };

    getSize();

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

        // adding an if statement stops the console log creating thousands of entries as the picture is moved. 
        if (manualMoveEnabled == false) {
            console.log("scale Factor = " + scaleFactor);
            console.log("imgWidth*scaleFactor = " + imgWidth * scaleFactor);
        }
    }


    // Event listener for scale slider change
    $("#scaleSlider").on("input", function () {
        let scale = $(this).val();
        updateBackgroundScale(scale);

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

    // Toggle button event listener
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

   
   
    // making the grid! 

    //Show grid toggle 
    gridToggleButton.addEventListener("click", function () {
        showGrid = !showGrid;
        gridToggleButton.textContent = showGrid ? "Hide Grid" : "Show Grid";
        const grid = document.getElementById("verticalLineDiv");  
        console.log("grid toggle button output");
        
        if (grid.style.display == "block") {
        grid.style.display = "none"; 
        } else {
        grid.style.display = "block";
        };    

          // Call the function with the container div and desired parameters
  const container = document.getElementById('verticalLineDiv');
  createParallelLines(container, 13, container.offsetWidth);

   });

    // Inside the document.ready function after other DOM manipulations
    // Position the line at the center of the imageView
    // verticalLine.style.left = `${imageViewWidth / 2}px`;

    // Update the vertical line position on window resize (optional)
    window.addEventListener("resize", function () {
        const newImageViewWidth = document.getElementById("imageView").offsetWidth;
        verticalLine.style.left = `${newImageViewWidth / 2}px`;

    });

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


  // create the grid lines
  // Function to create a vertical line in the container
  function createVerticalLine(container, offset) {
    const line = document.createElement('div');
    line.classList.add('line');
    line.style.left = offset + 'px';
    container.appendChild(line);
  }

  // Function to create parallel lines with regular offset
  function createParallelLines(container, count, totalWidth) {
    const lineThickness = 1; // Set line thickness to 1 pixel
    const totalLinesWidth = count * lineThickness;
    const spacing = (totalWidth - totalLinesWidth) / (count - 1);

    for (let i = 0; i < count; i++) {
      createVerticalLine(container, i * (spacing + lineThickness));
    }
  }



    // make a central line and then create parallel lines that are offset from this by regular amounts e.g. 10px
    

});
