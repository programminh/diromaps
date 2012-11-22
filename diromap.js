// Make canvas, its context, and the image global.
var canvas;
var ctx;
var img;
var currentPosition = {x: 0, y: 0};
var translatePosition = {x: 0, y: 0};
var currentZoom = 1;
var zoomMultiplier = 0.9;

// Detects if we are dragging or not.
var draggable = false;

var currentFloor = 0;
var floors = [
    {image: "images/etage1.gif", width: 587, height: 612},
    {image: "images/etage2.gif", width: 587, height: 635},
    {image: "images/etage3.gif", width: 587, height: 645}
];

$(document).ready(function() {
    canvas = $('#canvas');
    translatePosition = {
        x: 0,
        y: 0
    };
    ctx = canvas[0].getContext("2d");
    img = new Image();
    img.src = "images/etage1.gif";
    img.onload = function() {
        // Load first floor
        ctx.drawImage(img, 0, 0);
    };

    $('#zoomIn').on("click", function () {
        currentZoom /= zoomMultiplier;
        draw();
    });

    $('#zoomOut').on("click", function () {
        currentZoom *= zoomMultiplier;
        draw();
    });

    // Install listeners for canvas dragging
    canvas.on("mousedown", function (e) {
        draggable = true;
        currentPosition = {x: e.clientX - translatePosition.x,
                           y: e.clientY - translatePosition.y};

        // Disable text select cursor
        document.onselectstart = function() {
            return false;
        };

        // Change the cursor to a grabbing hand
        canvas.addClass('grabbing');
    });

    canvas.on("mouseup", function (e) {
        draggable = false;

        // Enable text select cursor
        document.onselectstart = function() {
            return true;
        };

        // Change the cursor to a pointer
        canvas.removeClass('grabbing');
    });

    canvas.on("mousemove", moveMap);

    $('#up').on("click", function () {
        resetPreviousPosition();
        currentFloor = (currentFloor + 1) % floors.length;
        loadFloor(currentFloor);
    });

    $('#down').on("click", function () {
        resetPreviousPosition();
        // HACK
        if (currentFloor === 0)
            currentFloor = floors.length - 1;
        else
            currentFloor = (currentFloor - 1);
        loadFloor(currentFloor);
    });

});

function resetPreviousPosition() {
    previousPosition = {x: 0, y: 0};
}


function loadFloor(floorIndex) {
    var floor = floors[floorIndex];
    img.src = floor.image;
    currentZoom = 1;
    draw();
}


function moveMap(e) {
    if (draggable) {
        translatePosition.x = e.clientX - currentPosition.x;
        translatePosition.y = e.clientY - currentPosition.y;
        draw();
    }
}


// function redrawFloor(x, y) {
//     ctx.clearRect(0, 0, 640, 480);
//     ctx.save();
//     ctx.translate(x, y);
//     ctx.scale(currentZoom, currentZoom);
//     ctx.drawImage(img, 0, 0);
//     //ctx.drawImage(img, x, y);
//     ctx.restore();
// }

// function zoom() {
//     var width = floors[currentFloor].width;
//     var height = floors[currentFloor].height;
//     var newWidth = width * currentZoom;
//     var newHeight = height * currentZoom;
//     var ratio = width / newWidth;

//     ctx.clearRect(0, 0, 640, 480);
//     ctx.save();
//     console.log(previousPosition);
//     ctx.translate(-((newWidth - width) / 2) - currentZoom*previousPosition.x,
//                   -((newHeight - height) / 2) - currentZoom*previousPosition.y);
//     ctx.scale(currentZoom, currentZoom);
//     ctx.drawImage(img, 0, 0);
//     ctx.restore();
// }

function draw() {
    ctx.clearRect(0, 0, 640, 480);
    ctx.save();
    ctx.translate(translatePosition.x, translatePosition.y);
    ctx.scale(currentZoom, currentZoom);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}
