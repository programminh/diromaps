// Make canvas, its context, and the image global.
var canvas;
var ctx;
var img;
var currentPosition = {x: 0, y: 0};
var previousPosition = {x: 0, y: 0};
var currentZoom = 1;

// Detects if we are dragging or not.
var draggable = false;

var currentFloor = 0;
var floors = [
    {image: "images/etage1.gif", width: 587, height: 612},
    {image: "images/etage2.gif", width: 587, height: 635},
    {image: "images/etage3.gif", width: 587, height: 645}
];

$(document).ready(function() {
    console.log('ready');

    canvas = $('#canvas');
    ctx = canvas[0].getContext("2d");
    img = new Image();
    img.src = "images/etage1.gif";
    img.onload = function() {
        // Load first floor
        ctx.drawImage(img, 0, 0);
    };



    // Install listeners for canvas dragging
    canvas.on("mousedown", function (e) {
        currentPosition = {x: e.clientX + previousPosition.x,
                           y: e.clientY + previousPosition.y};
        draggable = true;

        // Disable text select cursor
        document.onselectstart = function() {
            return false;
        };

        // Change the cursor to a grabbing hand
        canvas.addClass('grabbing');
    });

    canvas.on("mouseup", function (e) {
        previousPosition = {x: currentPosition.x - e.clientX,
                            y: currentPosition.y - e.clientY};
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
            currentFloor = (currentFloor - 1) % floors.length;
        loadFloor(currentFloor);
    });

    $('#zoomIn').on("click", zoomIn);
    $('#zoomOut').on("click", zoomOut);

});

function resetPreviousPosition() {
    previousPosition = {x: 0, y: 0};
}


function loadFloor(floorIndex) {
    var floor = floors[floorIndex];
    img.src = floor.image;
    currentZoom = 1;
    redrawFloor(0, 0);
}


function moveMap(e) {
    if (draggable) {
        redrawFloor(e.clientX - currentPosition.x, e.clientY - currentPosition.y);
    }
}


function redrawFloor(x, y) {
    ctx.clearRect(0, 0, 640, 480);
    ctx.drawImage(img, x, y,
                  floors[currentFloor].width*currentZoom,
                  floors[currentFloor].height*currentZoom);
}

function zoom() {
    var width = floors[currentFloor].width*currentZoom;
    var height = floors[currentFloor].height*currentZoom;
    var newWidth = width * currentZoom;
    var newHeight = height * currentZoom;

    ctx.clearRect(0, 0, 640, 480);
    ctx.save();
    ctx.translate(-((newWidth - width) / 2), -((newHeight - height) / 2));
    ctx.scale(currentZoom, currentZoom);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

function zoomIn() {
    currentZoom += 0.2;
    resetPreviousPosition();
    zoom();
}

function zoomOut() {
    currentZoom -= 0.2;
    resetPreviousPosition();
    zoom();
}
