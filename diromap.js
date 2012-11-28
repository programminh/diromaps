// Make canvas, its context, and the image global.
var canvas;
var ctx;
var img;
var currentPosition = {x: 0, y: 0};
var translatePosition = {x: 0, y: 0};
var currentZoom = 1;
var zoomMultiplier = 0.9;
var infoBubble;

// Detects if we are dragging or not.
var draggable = false;

var currentFloor = 0;

var floors = [
    {image: "images/etage1.gif", width: 587, height: 612},
    {image: "images/etage2.gif", width: 587, height: 635},
    {image: "images/etage3.gif", width: 587, height: 645}
];

$(document).ready(function() {


    infoBubble = $('#info');
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

    canvas.on("click", getHotspot);

    canvas.on("mousemove", moveMap);

    $('#up').on("click", function () {
        resetPreviousPosition();

        // Reset translate position
        translatePosition.x = 0;
        translatePosition.y = 0;

        // Hide the bubble
        infoBubble.addClass('hide');

        currentFloor = (currentFloor + 1) % floors.length;
        loadFloor(currentFloor);
    });

    $('#down').on("click", function () {
        resetPreviousPosition();

        // Reset translate position
        translatePosition.x = 0;
        translatePosition.y = 0;

        // Hide the bubble
        infoBubble.addClass('hide');

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
        // Hide the info bubble
        infoBubble.addClass('hide');
        translatePosition.x = e.clientX - currentPosition.x;
        translatePosition.y = e.clientY - currentPosition.y;
        draw();
    }
}

/**
 * Computes whether a point is within a polygon
 * Based on the Jordan Curve Theorem
 * This is a JavaScript adaptation of the C code provided by W. Randolph Franklin at
 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * @param  {Array} xs Array of the X coordinates of the polygon
 * @param  {Array} ys Array of the Y coordinates of the polygon
 * @param  {int} x  Coordinate x of the point
 * @param  {int} y  Coordinate y of the point
 * @return {boolean}    Within the point or not
 */
function pnpoly(xs, ys, x, y)
{
  var i, j, c = false;
  var nvert = xs.length;

  for (i = 0, j = nvert-1; i < nvert; j = i++) {
    if ( ((ys[i]>y) != (ys[j]>y)) &&
     (x < (xs[j]-xs[i]) * (y-ys[i]) / (ys[j]-ys[i]) + xs[i]) )
       c = !c;
  }
  return c;
}

function getHotspot(e) {
    var infoText;

    // Get location of the canvas rectangle
    var rect = canvas[0].getBoundingClientRect();

    // Coordinates within the canvas
    var x = e.clientX - Math.round(rect.left);
    var y = e.clientY - Math.round(rect.top);

    // Choose the array of hotspot according to the current floor
    var floorHotspot = hotspots[currentFloor];
    var currentHotspot = null;

    var translatedX, translatedY;

    // Iterate through all the hotspots on the current floor
    for (var i = floorHotspot.length - 1; i >= 0; i--) {

        // Translate the new coordinates according to the translation and the zoom
        translatedX = $.map(floorHotspot[i].xs, function(n){
            return (n * currentZoom + translatePosition.x);
        });

        translatedY = $.map(floorHotspot[i].ys, function(n){
            return (n * currentZoom + translatePosition.y);
        });

        // Check if point is within the polygon
        if (pnpoly(translatedX, translatedY, x, y)) {
            currentHotspot = floorHotspot[i];
            break;
        }
    }

    if(currentHotspot != null) {
        if (currentHotspot.action) {
            currentHotspot.action();
        }
        // Check whether there is an url attribute
        else if(currentHotspot.url) {
            infoText = '<a href="' + currentHotspot.url + '">' + currentHotspot.text + '</a>';
        }
        else {
            infoText = currentHotspot.text;
        }

        // Draw a stroke around for the hotspot
        drawPolygon(translatedX, translatedY);

        // Display the info bubble
        infoBubble.html(infoText)
                    .removeClass('hide')
                    .css('left', e.clientX)
                    .css('top', e.clientY);
    }
    else {
        infoBubble.addClass('hide');
        draw();
    }
}

function draw() {
    ctx.clearRect(0, 0, 640, 480);
    ctx.save();
    ctx.translate(translatePosition.x, translatePosition.y);
    ctx.scale(currentZoom, currentZoom);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

/**
 * Draws a red stroked polygon
 * @param  {Array} xs Array of X coords
 * @param  {Array} ys Array of Y coords
 */
function drawPolygon(xs, ys) {
    // This prevents multiple stroked area
    draw();

    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);

    for (var i = 1; i < xs.length; i++) {
        ctx.lineTo(xs[i], ys[i]);
    }
    ctx.strokeStyle = "#CD0000";
    ctx.lineWidth = 1;
    ctx.closePath();
    ctx.stroke();
}

function checkFloor(floor) {
    return floor >= 0 && floor <= floors.length;
}

function selectFloor(choice) {
    var newFloor = prompt("À quel étage voulez-vous aller?", choice) - 1;
    if (checkFloor(newFloor))
        return newFloor;
    else
        return currentFloor;
}

function elevatorUp() {
    var choice = (currentFloor + 1) % floors.length + 1;
    currentFloor = selectFloor(choice);
    loadFloor(currentFloor);
}

function elevatorDown() {
    var choice;
    if (currentFloor === 0)
        choice = floors.length;
    else
        choice = currentFloor;;
    currentFloor = selectFloor(choice);
    loadFloor(currentFloor);
}
