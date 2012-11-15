// Make canvas, its context, and the image global.
var canvas;
var ctx;
var img;
var currentPosition;
var previousPosition = {x: 0, y: 0};

// Detects if we are dragging or not.
var draggable = false;

var currentFloor = 0;
var floors = ["images/etage1.gif",
              "images/etage2.gif",
              "images/etage3.gif"];

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    img = new Image();

    // Install listeners for canvas dragging
    canvas.addEventListener("mousedown", function (e) {
        currentPosition = {x: e.clientX + previousPosition.x,
                           y: e.clientY + previousPosition.y};
        draggable = true;
    });
    canvas.addEventListener("mouseup", function (e) {
        previousPosition = {x: currentPosition.x - e.clientX,
                            y: currentPosition.y - e.clientY};
        draggable = false;
    });
    canvas.addEventListener("mousemove", moveMap);

    document.getElementById("up").addEventListener("click", function () {
        resetPreviousPosition();
        currentFloor = (currentFloor + 1) % floors.length;
        loadFloor(currentFloor);
    });

    document.getElementById("down").addEventListener("click", function () {
        resetPreviousPosition();
        // HACK
        if (currentFloor === 0)
            currentFloor = floors.length - 1;
        else
            currentFloor = (currentFloor - 1) % floors.length;
        loadFloor(currentFloor);
    });

    loadFloor(0);
}


function resetPreviousPosition() {
    previousPosition = {x: 0, y: 0};
}


function loadFloor(n) {
    img.src = floors[n];
    ctx.drawImage(img, 0, 0);
}


function moveMap(e) {
    if (draggable) {
        ctx.clearRect(0, 0, 640, 480);
        ctx.drawImage(img,
                      e.clientX - currentPosition.x,
                      e.clientY - currentPosition.y);
    }
}


window.addEventListener("load", init);
