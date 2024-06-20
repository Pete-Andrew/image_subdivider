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
    const fineSizeUpButton = document.getElementById('fineSizeUp');
    const fineSizeDownButton = document.getElementById('fineSizeDown');
    const courseSizeUpButton = document.getElementById('courseSizeUp');
    const courseSizeDownButton = document.getElementById('courseSizeDown');
    const openNavButton = document.getElementById('openNavButton');
    const closeNavButton = document.getElementById('closeNavButton');
    const scaleSlider = $('#scaleSlider');
    const gridLineSlider = $('#gridLineScaleSlider');
    const gridFullWidthButton = document.getElementById('gridFullWidthToggleButton');
    const lineColourButton = document.getElementById('lineColourButton');
    const testColourDiv = document.getElementById('testColourDiv');
    const lineWeightButton = document.getElementById('lineWeightButton');
    const gridSliderUpButton = document.getElementById('gridSliderUpButton');
    const gridSliderDownButton = document.getElementById('gridSliderDownButton');
    const gridSliderUpButtonFour = document.getElementById('gridSliderUpButtonFour');
    const gridSliderDownButtonFour = document.getElementById('gridSliderDownButtonFour');
    const aboutButton = document.getElementById('aboutButton');
    const resetButton = document.getElementById('resetButton');
    const lineNumDisplay = document.getElementById('lineNumDisplay');

    // variables that deal with line spacing
    let containerHeight = imageView.clientHeight; // Get the container height
    let centerOffset = containerHeight / 2; // Calculate the center position
    // Calculate the initial offset for the first line to be at the center
    let initialOffset = centerOffset;
    let container = document.getElementById('verticalLineDiv');
    let grid = document.getElementById("verticalLineDiv");
    
    let scaleSliderValue = parseFloat(scaleSlider.val()); // Initialize scale value
    let gridSliderValue = parseFloat(gridLineSlider.val()); // Initialize grid slider value
    let hzLineNum = 0; // Default number of horizontal lines
    let spacingPixels = 0; // sets the spacing between gridlines, taken from the distance between vertlines
    let totalImageViewWidth = 0;
    let totalImageViewHeight = 0;
    let imgWidth = 0;
    let imgHeight = 0;
    let vertLineNum = 3;
    let scale = 1;
    let scaleFactor = 1;
    let currentScaleFactor = 1;
    let initialX;
    let initialY;
    let offsetX = 0;
    let offsetY = 0;
    let backgroundImageDivWidth = 0;
    let backgroundImageDivHeight = 0;
    let imageImportScaleUp = 0;
    let imageProportionHTW = 0;
    let imageProportionWTH = 0;
    let backgroundImgDivProportions = 0;
    let testColourDivWidth = 0;
    let testColourDivHeight = 0; 
    
    let isDragging = false;
    let manualMoveEnabled = false;
    let showGrid = false;
    let showHzLines = true;
    let showVertLines = true;
    let paused = false;
    let cameraOn = false;
    let gridFullContainerWidth = true;
    let testDivVisible = false;
    let lineColourWhite = false; 
  
    let currentFacingMode = 'user'; // Default to front camera
    
    container.style.display = "none";

    // list of BUGS! >>> 


    // changes the line colour from black to white by inserting rules into the CSS
    lineColourButton.addEventListener('click', function () {
        console.log("line colour has been changed");

        if (lineColourWhite == false) {
            lineColourWhite = true;

            var styleSheet = document.styleSheets[0];
            styleSheet.insertRule('.line { background-color: white !important; }', styleSheet.cssRules.length);
            styleSheet.insertRule('.horizontalLine { background-color: white !important; }', styleSheet.cssRules.length);

        } else {
            lineColourWhite = false;
            var styleSheet = document.styleSheets[0]; // can this be declared as a global variable?
            styleSheet.insertRule('.line { background-color: black !important; }', styleSheet.cssRules.length);
            styleSheet.insertRule('.horizontalLine { background-color: black !important; }', styleSheet.cssRules.length);
        }
    });

    // switches the grid between 'image only' and full div width 
    gridFullWidthButton.addEventListener('click', function () {
        // toggles the button
        gridFullContainerWidth = !gridFullContainerWidth;
        gridFullWidthButton.textContent = gridFullContainerWidth ? "Image Only Grid" : "Full Grid";
        
        //Hides the 'image only' div 
        if (testDivVisible == true) {
            testColourDiv.style.display = "none";
            // clears the testDiv and re-assigns the 'container' variable to the 'verticalLineDiv' ID
            container.innerHTML = '';
            container = document.getElementById('verticalLineDiv');
            testDivVisible = false;
            console.log("test Div Visible = " + testDivVisible);

            getImageViewWidth(imageView);  
            spacingPixels = totalImageViewWidth / (vertLineNum - 1); // have to -1 to get the correct scale e.g. make all the division cubes
            createParallelLines(container, vertLineNum);

            if (showHzLines == true) {      
            //vertLineNum needs to be * 3 or it only uses the vertline number and you end up with not enough hz lines    
            createHzParallelLines(container, vertLineNum*3, spacingPixels); 
        }

        // Reveals the 'image only' div
        } else if (testDivVisible == false) {
            testColourDiv.style.display = "block";
            testDivVisible = true;
            console.log("test Div Visible = " + testDivVisible);
            // Clear existing lines
            container.innerHTML = '';
            // changes the container to be the size of the image
            container = testColourDiv;
            // sets size of test div
            setTestDivSize();
            // draws the vert parallel lines      
            createParallelLines(container, vertLineNum);

            spacingPixels = testColourDivWidth / (vertLineNum - 1); //constrains grid lines to a square
            hzLineNum = testColourDivHeight / spacingPixels; // need to round this to an even number.....
            
            if (showHzLines == true) {
            createHzParallelLines(container, hzLineNum, spacingPixels); 
            }
        }
    });

    // sets the size of the 'image only' test div
    function setTestDivSize() {
        if (backgroundImgDivProportions < imageProportionHTW) {
            // height > width
            testColourDiv.style.height = 100 + "%";
            testColourDiv.style.width = backgroundImageDivHeight * imageProportionWTH + "px";
            // value will be the same as the div height as the image will fill 100% of the div
            
            testColourDivHeight = backgroundImageDivHeight;
            testColourDivWidth = Math.round(backgroundImageDivHeight * imageProportionWTH * 1000)/1000;
            console.log("image is " + testColourDivHeight + " px tall");
            console.log("image is " + testColourDivWidth + " px wide" );
        } else {
            // width > height
            testColourDiv.style.width = 100 + "%";
            testColourDiv.style.height = backgroundImageDivWidth * imageProportionHTW + "px";
            // value will be the same as the div width as the image will fill 100% of the div
            
            testColourDivWidth = backgroundImageDivWidth;
            testColourDivHeight = Math.round(backgroundImageDivWidth * imageProportionHTW * 1000)/1000;
            console.log("image is " + testColourDivWidth + " px wide");
            console.log("image is " + testColourDivHeight + " px tall");
        }
    };

    // as the imported image is scaled to fill the div 100%...
    function findImportedImageScalingPx() {
        // Calculate how much it has been scaled (either positive or negative)  
        imageImportScaleUp = totalImageViewHeight / imgHeight;
        console.log("Diff in scale between imported image and div (div height/actual image height) = " + Math.round(imageImportScaleUp * 1000) / 1000);
        // get height to width proportion 
        imageProportionHTW = imgHeight / imgWidth;
        imageProportionWTH = imgWidth / imgHeight;
        console.log("image proportion (height to width) = " + Math.round(imageProportionHTW * 1000) / 1000);
        console.log("image proportion (width to height) = " + Math.round(imageProportionWTH * 1000) / 1000);

        if (imageProportionHTW == 1) {
            console.log("woo! this one's a square!");
        }
    };

    // gets the proportions of the imgDiv
    function backgroundImgDivProportionFunc() {
        backgroundImageDivHeight = backgroundImage.offsetHeight;
        backgroundImageDivWidth = backgroundImage.offsetWidth;
        backgroundImgDivProportions = backgroundImageDivHeight / backgroundImageDivWidth;
        console.log("background Img Div Proportions (height/width) = " + Math.round(backgroundImgDivProportions * 1000) / 1000);
    };

    // code for the side nav bar 
    openNavButton.addEventListener('click', function () {
        document.getElementById("mySidenav").style.width = "350px";
    });

    closeNavButton.addEventListener('click', function () {
        document.getElementById("mySidenav").style.width = "0px";
    });

    // get the size of the imported image
    function getSize() {
        $("#inputFile").change(function (e) {
            var file, img;

            if ((file = this.files[0])) {
                img = new Image(); //Image() constructor creates a new HTMLImageElement instance. It is functionally equivalent to document.createElement('img').
                img.onload = function () {

                    imgWidth = this.width;
                    imgHeight = this.height;
                    // logs out the size of the imported im in px
                    console.log("raw imported Width of img (imgWidth) in px = " + imgWidth);
                    console.log("raw imported Height of img (imgHeight) in px = " + imgHeight);

                    backgroundImageDivWidth = backgroundImage.offsetWidth;
                    backgroundImageDivHeight = backgroundImage.offsetHeight;
                    console.log("width of background image Div = " + backgroundImageDivWidth);
                    console.log("height of background image Div = " + backgroundImageDivHeight);
                    backgroundImgDivProportionFunc();
                    findImportedImageScalingPx();
                };

                img.onerror = function () {
                    alert("not a valid file: " + file.type);
                };

                // Log the name of the uploaded file
                // console.log("Name of the uploaded image: " + file.name);
                img.src = URL.createObjectURL(file); //Each time you call createObjectURL(), a new object URL is created.
                imgLoaded = true;
                // console.log("image loaded = " + imgLoaded);
            }
        });
    };
    getSize();

    //gets the width of the 'imageView' div, which holds the image
    function getImageViewWidth(imageView) {
        totalImageViewWidth = Number(imageView.offsetWidth);
        totalImageViewHeight = Number(imageView.offsetHeight);
        console.log("Image View width = " + totalImageViewWidth);
        console.log("Image View height = " + totalImageViewHeight);
    }

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

    // changes the size of the image, gets called by the scale slider function and the update scale buttons
    function updateBackgroundScale(scale) {
        scaleFactor = scale;
        let translateX = offsetX - (backgroundImage.offsetWidth / 2);
        let translateY = offsetY - (backgroundImage.offsetHeight / 2);
        backgroundImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        console.log("proportion of full size = " + scale);
        
    // measureLineSpace(container, vertLineNum);
        if (backgroundImgDivProportions < imageProportionHTW) {
            testColourDiv.style.height = (backgroundImage.offsetHeight * scale) + "px";
            testColourDiv.style.width = (backgroundImageDivHeight * imageProportionWTH) * scale + "px";
        } else {
            testColourDiv.style.height = (backgroundImageDivWidth * imageProportionHTW) * scale + "px";
            testColourDiv.style.width = (backgroundImage.offsetWidth * scale) + "px";
            console.log("wicca wicca woo");
        }
    }

    // listens for the scale slider 
    $("#scaleSlider").on("input", function () {
        scale = parseFloat($(this).val());  //parseFloat enables the fine size buttons to work if the image has been re-scaled with the slider
        // console.log("current scale = " + scale);
        scaleSliderValue = scale;
        updateBackgroundScale(scale);
    });

    //code for the course and fine size scale buttons 
    courseSizeUpButton.addEventListener('click', function () {
        if (scale < 2) {
            scale += 0.005;
            // scaleSliderValue = scale +=0.05;
            scaleSliderValue = Math.min(scaleSliderValue + 0.005, 2); // Ensure scale doesn't exceed max value
            scaleSlider.val(scaleSliderValue);
            //needs to update the scale slider value
            //needs to set a max of 2 for scale and a min of 0.1
            updateBackgroundScale(scale);

        } else {
            console.log("max scale reached");
        }
    });

    fineSizeUpButton.addEventListener('click', function () {
        if (scale < 2) {
            scale += 0.0005;
            // scaleSliderValue = scale +=0.05;
            scaleSliderValue = Math.min(scaleSliderValue + 0.0005, 2); // Ensure scale doesn't exceed max value
            scaleSlider.val(scaleSliderValue);
            //needs to update the scale slider value
            //needs to set a max of 2 for scale and a min of 0.1
            updateBackgroundScale(scale);

        } else {
            console.log("max scale reached");
        }
    });

    courseSizeDownButton.addEventListener('click', function () {
        if (scale > 0.1) {
            scale -= 0.005;
            // scaleSliderValue = scale +=0.05;
            scaleSliderValue = Math.min(scaleSliderValue - 0.005, 2); // Ensure scale doesn't exceed max value
            scaleSlider.val(scaleSliderValue);
            updateBackgroundScale(scale);

        } else {
            console.log("max scale reached");
        }
    });

    fineSizeDownButton.addEventListener('click', function () {
        if (scale > 0.1) {
            scale -= 0.0005;
            scaleSliderValue = Math.min(scaleSliderValue - 0.0005, 2); // Ensure scale doesn't exceed max value
            scaleSlider.val(scaleSliderValue);
            updateBackgroundScale(scale);

        } else {
            console.log("min scale reached");
        }
    });

    // changes the grid density when called.
    function changeGridDensity () {
        
        if (testDivVisible == true) {
        
        console.log("spacing pixels value = " + spacingPixels)
        console.log("testColourDivHeight value = " + testColourDivHeight);
        
        let hzLineNumRaw = vertLineNum * imageProportionHTW
        console.log("raw Hz line Count = " + hzLineNumRaw);
        hzLineNum = Math.floor(vertLineNum * imageProportionHTW);
        
        console.log("rounded Hz line Count = " + hzLineNum);    

        } else if (testDivVisible == false) {
        hzLineNum = vertLineNum * 3; // *3 makes sure there are always enough horizontal grid lines (unless the image is ridiculously distorted)
        }
        
        console.log("vertLineNum = " + vertLineNum);
        console.log("Container width = " + container.offsetWidth + " px");
        container.innerHTML = ''; // Clear existing lines    

        // if else for if the 'image only grid' button is ticked, this makes sure the grid lines maintain squares
        if (testDivVisible == false) {
        spacingPixels = totalImageViewWidth / (vertLineNum - 1); // have to -1 to get the correct scale e.g. make all the division cubes
        console.log("line spacing in PX = " + spacingPixels);
    } else {
        spacingPixels = testColourDivWidth / (vertLineNum - 1);
        console.log("line spacing in PX = " + spacingPixels);
    }
        createParallelLines(container, vertLineNum); // Recreate lines
        if (showHzLines == true) { createHzParallelLines(container, hzLineNum, spacingPixels); 
        };
        lineNumberDisplay();
    }

    // updates the grid lines when the slider is changed
    $("#gridLineScaleSlider").on("input", function () {
        gridSliderValue = parseFloat($(this).val()); //need to be parsed or the gridSLider buttons don't work
        console.log("Grid slider value = " + gridSliderValue); 
        vertLineNum = $(this).val();
        changeGridDensity();        
    });

    // buttons for updating grid density 
    gridSliderUpButton.addEventListener('click', function () {
        if (gridSliderValue < 59) {
            console.log("grid slider up button clicked");
            gridSliderValue += 2;
            vertLineNum = gridSliderValue;
            console.log("Grid slider value = " + gridSliderValue);
            gridLineSlider.val(gridSliderValue);
            changeGridDensity();
        }
        else {
            console.log("max value reached");
        }
    })

    gridSliderDownButton.addEventListener('click', function () {
        if (gridSliderValue > 3) {
            console.log("grid slider down button clicked");
            gridSliderValue -= 2;
            vertLineNum = gridSliderValue;
            console.log("Grid slider value = " + gridSliderValue);
            gridLineSlider.val(gridSliderValue);
            changeGridDensity();
        } else {
            console.log("min value reached");
        }
    });

    gridSliderUpButtonFour.addEventListener('click', function () {
        if (gridSliderValue < 59) {
            console.log("grid slider up 4 button clicked");
            gridSliderValue = (gridSliderValue*2)-1; //this doubles the number grid lines 
            vertLineNum = gridSliderValue;
            console.log("Grid slider value = " + gridSliderValue);
            gridLineSlider.val(gridSliderValue);
            changeGridDensity();
        } else {

            console.log("max value reached");
        }
    } )

    gridSliderDownButtonFour.addEventListener('click', function () {
        if (gridSliderValue > 3) {
            console.log("grid slider up 4 button clicked");
            gridSliderValue = (gridSliderValue+1)/2; 
            vertLineNum = gridSliderValue;
            console.log("Grid slider value = " + gridSliderValue);
            gridLineSlider.val(gridSliderValue);
            changeGridDensity();
        } else {
            // need to catch even numbers of gridsliderValue 
            // need to catch half numbers
            // this only matters at the low end of the scale
            gridSliderValue = 3;
           
            console.log("min value reached");
            console.log("Grid slider value = " + gridSliderValue);
        }
    });

    function lineNumberDisplay () {
        lineNumDisplay.innerHTML = "Grid Line Number: " + vertLineNum;
    }
    lineNumberDisplay();

    resetButton.addEventListener ('click', function () {
        console.log("reset clicked");
        //changed the grid slider
        gridSliderValue = 3;
        gridLineSlider.val(gridSliderValue);
        //changed the value of vertical lines
        vertLineNum = 3;
        container.innerHTML = ''; // Clear existing lines    
        changeGridDensity();
    })


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
        
        // checks to see if the grid is 'image only'
        if (testDivVisible == false) {
        grid = document.getElementById("verticalLineDiv");       
        } else {
        grid = document.getElementById("testColourDiv");
        }

        if (grid.style.display == "block") {
            grid.style.display = "none";
        } else {
            grid.style.display = "block";
        };
    });

    // this function re-draws the lines when the grid is re-sized
    function updateGrid(container) {
        container.innerHTML = ''; // Clear existing lines
        createParallelLines(container, vertLineNum); // Recreate lines
        measureLineSpace(container, vertLineNum)
        console.log("updateGrid func called");
    }
    // needs to be called on initialisation to make sure the line spacing is set correctly (?) 
    updateGrid(container);

    // measures the space between lines
    function measureLineSpace(container, vertLineNum) {

        // if else statement if 'image only grid' is being used....
        if (testDivVisible == false) {
            getImageViewWidth(imageView); // updates the totalImageView width global variable. 
            spacingPixels = totalImageViewWidth / (vertLineNum - 1); // have to -1 to get the correct scale e.g. make all the division cubes / square
            if (showHzLines) { createHzParallelLines(container, hzLineNum*3, spacingPixels); } //calls this function with updated spacing pixels IF showHzLines bool is true. 
        } else if (testDivVisible == true) {
            // container = testColourDiv;
            spacingPixels = testColourDivWidth / (vertLineNum - 1);
            console.log("test div is visible");
            if (showHzLines) { createHzParallelLines(container, hzLineNum, spacingPixels); } //calls this function with updated spacing pixels IF showHzLines bool is true. 
        }
    }

    //resizes the grid if the window size is changed
    window.addEventListener('resize', function () {
        backgroundImgDivProportionFunc(); // gets the proportions of the image div
        setTestDivSize(); //sets the size of the test div
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
        // this if statement allows the hz grid lines to be vertically centralised in the div
        if (testDivVisible == true) {
        containerHeight = testColourDivHeight; // Get the container height
        centerOffset = containerHeight / 2; // Calculate the center position
        // Calculate the initial offset for the first line to be at the center
        initialOffset = centerOffset;
        } else {
        // this re-sets the code if test div is no longer visible
        containerHeight = imageView.clientHeight; // Get the container height
        centerOffset = containerHeight / 2; // Calculate the center position
        // Calculate the initial offset for the first line to be at the center
        initialOffset = centerOffset;    
        }

        // Create the central line
        createHorizontalLine(container, initialOffset);

        //sets a count for both the top and bottom lines so that they are equal
        let topAndBottomHzLinesCount = Math.ceil(count / 2);

        // Create lines above the central line
        for (let i = 1; i < topAndBottomHzLinesCount+1; i++) {
            createHorizontalLine(container, initialOffset - i * spacingPixels);
        }
        // Create lines below the central line
        for (let i = 1; i < topAndBottomHzLinesCount+1; i++) { 
            createHorizontalLine(container, initialOffset + i * spacingPixels);
        }
    }

    //toggle the Hz lines on / off. 
    horizontalGridToggleButton.addEventListener("click", function () {
        
        console.log("showHzLine = " + showHzLines);
        horizontalGridToggleButton.textContent = !showHzLines ? "Hide Hz Grid" : "Show Hz Grid";
        // const grid = document.getElementById("verticalLineDiv");
        if (showHzLines == true) {
            container.innerHTML = ''; // Clear existing lines
            console.log("Hidden Hz Grid Lines");
            showHzLines = false;
            createParallelLines(container, vertLineNum);

        } else {
            console.log("Un-hidden Hz Grid Lines");
            showHzLines = true;
            // if statement to change the hz line number if the test div is visible.
            if (testDivVisible == true) { 
                createHzParallelLines(container, hzLineNum, spacingPixels); 
            } else { 
                createHzParallelLines(container, vertLineNum*3, spacingPixels); 
            }
        };
    });

    // toggles the vertical lines on/off
    verticalGridToggleButton.addEventListener("click", function () {
        verticalGridToggleButton.textContent = !showVertLines? "Hide Vert Grid" : "Show Vert Grid"

        if (showVertLines == true) {
            container.innerHTML = '';
            var styleSheet = document.styleSheets[0];
            styleSheet.insertRule('.line { width: 0px !important; }', styleSheet.cssRules.length);
            
            createParallelLines(container, vertLineNum); // Recreate lines
            if (showHzLines) { createHzParallelLines(container, hzLineNum, spacingPixels); };
            console.log("hide vert grid lines has been clicked! woo!");
            showVertLines = !showVertLines;
            console.log(showVertLines);

        } else {
            var styleSheet = document.styleSheets[0];
            styleSheet.insertRule('.line { width: 1px !important; }', styleSheet.cssRules.length);
            createParallelLines(container, vertLineNum); // Recreate lines
            if (!showHzLines) { createHzParallelLines(container, hzLineNum, spacingPixels); };
            console.log("verticalGridToggleButton has been clicked! woo!");
            showVertLines = true;
        }
    });

    // if the re-center button is pressed
    function clearManipulations() {
        backgroundImage.style.backgroundPosition = "";
        backgroundImage.style.transform = "";
        offsetX = 0;
        offsetY = 0;
        backgroundImage.style.backgroundPosition = "center center";
        console.log("JavaScript manipulations cleared.");
    }

    // button to re-center the image if it has been manually moved off center (sometime it might be de-centralised if the screen has changed shape)
    reCenterToggleButton.addEventListener("click", function () {
        currentScaleFactor = scaleFactor;
        clearManipulations();
        // backgroundImage.style.backgroundPosition = "center center";
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

    aboutButton.addEventListener('click', function () {
        console.log("about button clicked");
    });

// <------------------------------------------------------------------------------------------------------------------------------------------------------------------------>

    // Camera Lucida function NOT CURRENTLY IN USE: 
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
