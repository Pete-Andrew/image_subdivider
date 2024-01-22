const dropArea = document.getElementById("dropArea");
const inputFile = document.getElementById("inputFile");
const imageView = document.getElementById("imageView");

//uses jquery to get the inputFile ID and calls the following function on change event 
$("#inputFile").change(function(e) {
    var file, img;

    if ((file = this.files[0])) {
        img = new Image();

        // alerts the width and height of the imported image. 
        // img.onload = function() {
        //     alert(this.width + " " + this.height);
        // };

        //logs the size of the imported image into the console. 
        img.onload = function() {
            console.log("Width = " + this.width);
            console.log("Height = " + this.height);
        };

        //throws an error if the file is not an image
        img.onerror = function() {
            alert( "not a valid file: " + file.type);
        };

        img.src = URL.createObjectURL(file);
    }
});

inputFile.addEventListener("change", uploadImage);

function uploadImage() {
    //image is entererd in an object format, needs converting using 'imageLink' function
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    
    //following code sets the uploaded and converted image to be the background image. 
    imageView.style.backgroundImage = `url(${imgLink})`;   
    
    //this code remove the text and border when the image upload: 
    imageView.textContent = ""; 
    // imageView.style.border = 0;

} 

// stops the page refreshing on drag over
dropArea.addEventListener("dragover", function(e){
    e.preventDefault();
});

dropArea.addEventListener("drop", function(e){
    e.preventDefault();
    //when you drop an image it will transfer that image into the 'inputFile' input field, 'inputFile.files[0]' then gets called in the uploadImage function.
    inputFile.files = e.dataTransfer.files;
    uploadImage();
});


// references: 
//https://www.youtube.com/watch?v=5Fws9daTtIs
//https://jsfiddle.net/4N6D9/1/
//https://stackoverflow.com/questions/8903854/check-image-width-and-height-before-upload-with-javascript
