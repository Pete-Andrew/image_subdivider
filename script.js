const dropArea = document.getElementById("dropArea");
const inputFile = document.getElementById("inputFile");
const imageView = document.getElementById("imageView");

inputFile.addEventListener("change", uploadImage);

function uploadImage() {
    //image is entererd in an object format, needs converting using 'imageLink' function
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    //following code sets the uploaded and converted image to be the background image. 
    imageView.style.backgroundImage = `url(${imgLink})`;   
    
    //this code remove the text and border when the image upload: 
    imageView.textContent = ""; 
    imageView.style.border = 0;
} 

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
//