$(document).ready(function() {
    const dropArea = document.getElementById("dropArea");
    const inputFile = document.getElementById("inputFile");
    const imageView = document.getElementById("imageView");
    const backgroundImage = document.getElementById("backgroundImage");
    const toggleButton = document.getElementById("toggleButton");
    const gridToggleButton = document.getElementById("gridToggleButton");
    const verticalLine = document.getElementById("verticalLine");
    const imageViewWidth = document.getElementById("imageView").offsetWidth;

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
    function getSize () {
        //uses jquery to get the inputFile ID and calls the following function on change event, $("#inputFile") is a jquery selector that selects a HTML element 
        $("#inputFile").change(function(e) {
            var file, img;
    
            if ((file = this.files[0])) {
                img = new Image();
    
                //logs the size of the imported image into the console. 
                img.onload = function() {

                    imgWidth = this.width;
                    console.log("original Width = " + imgWidth);
                    imgHeight = this.height;
                    console.log("original Height = " + imgHeight);
                    // gets the absolute value of the 'backgroundImage' div that is created when an image is imported.    
                    console.log(document.getElementById('backgroundImage').offsetWidth);

                };
    
                //throws an error if the file is not an image
                img.onerror = function() {
                    alert( "not a valid file: " + file.type);
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
    inputFile.addEventListener("change", function() {
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
    console.log("scale Factor = " + scaleFactor);
    console.log("imgWidth*scaleFactor = " + imgWidth*scaleFactor);
    }


    // Event listener for scale slider change
    $("#scaleSlider").on("input", function() {
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
    toggleButton.addEventListener("click", function() {
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

    gridToggleButton.addEventListener("click", function() {
        showGrid = !showGrid;
        gridToggleButton.textContent = showGrid ? "Hide Grid" : "Show Grid";
    });


// Inside the document.ready function after other DOM manipulations
// Position the line at the center of the imageView
verticalLine.style.left = `${imageViewWidth / 2}px`; 

// Update the line position on window resize (optional)
window.addEventListener("resize", function() {
    const newImageViewWidth = document.getElementById("imageView").offsetWidth;
    verticalLine.style.left = `${newImageViewWidth / 2}px`;

    });
});
