// Some strage events while dragging on touchpad, were it suddently shows the not 
// allowed cursor, and when it works again a few seconds later, you can move around 
// the item even if you released the mouse

const dragAndDrop = {
    moving: false,
    mousedown: false,
    mousex: 0,
    mousey: 0,
    objLeft: 0,
    objTop: 0,
    errorCheck: undefined
}

document.addEventListener("mousemove", (e) => { pointermove(e); });
document.addEventListener("touchmove", (e) => { pointermove(e); });

document.addEventListener("mousedown", (e) => { startmove(e); });
document.addEventListener("touchstart", (e) => { startmove(e); });

document.addEventListener("mouseup", (e) => { endmove(e); });
document.addEventListener("mouseleave", (e) => { endmove(e); });
document.addEventListener("touchend", (e) => { endmove(e); });
document.addEventListener("touchcancel", (e) => { endmove(e); });

function pointermove(e) {
    if (e.type == "touchmove") {
        dragAndDrop.mousex = e.touches[0].clientX;
        dragAndDrop.mousey = e.touches[0].clientY;
    } else {
        dragAndDrop.mousex = e.clientX;
        dragAndDrop.mousey = e.clientY;
    }
    if (dragAndDrop.moving != false) {
        dragAndDrop.moving.style.left = dragAndDrop.mousex - dragAndDrop.objLeft + "px";
        dragAndDrop.moving.style.top = dragAndDrop.mousey - dragAndDrop.objTop + "px";
    }
}

function startmove(e) {
    dragAndDrop.mousedown = true;
    let target;
    if (e.type == "touchstart") {
        dragAndDrop.mousex = e.touches[0].clientX;
        dragAndDrop.mousey = e.touches[0].clientY;
    } else {
        dragAndDrop.mousex = e.clientX;
        dragAndDrop.mousey = e.clientY;
    }
    if (e.type == "touchstart") target = document.elementFromPoint(dragAndDrop.mousex, dragAndDrop.mousey);
    else target = e.target;
    if (target.classList.contains("draggable")) {
        dragAndDrop.moving = target;
        let obj = target.getBoundingClientRect();
        dragAndDrop.objLeft = dragAndDrop.mousex - obj.left;
        dragAndDrop.objTop = dragAndDrop.mousey - obj.top;
        target.style.position = "fixed";
        dragAndDrop.moving.style.left = dragAndDrop.mousex - dragAndDrop.objLeft + "px";
        dragAndDrop.moving.style.top = dragAndDrop.mousey - dragAndDrop.objTop + "px";
        dragAndDrop.errorCheck = setInterval(() => {
            if (dragAndDrop.mousedown == false && dragAndDrop.moving != false) endmove(e);
        }, 300);
    }
}

function endmove(e) {
    dragAndDrop.mousedown = false;
    if (dragAndDrop.moving != false) {
        clearInterval(dragAndDrop.errorCheck);
        if (onPage(dragAndDrop.mousex, dragAndDrop.mousey)) {
            let targets;
            if (e.type == "touchend" || e.type == "touchcancel") {
                targets = document.elementsFromPoint(dragAndDrop.mousex, dragAndDrop.mousey);
            } else targets = document.elementsFromPoint(e.clientX, e.clientY);
            if (targets[1] && targets[1].classList.contains("droppable")) {
                // targets[1].append(dragAndDrop.moving);
                window[targets[0].getAttribute("data-ondrop")](targets[0], targets[1]);
            }
        }
        dragAndDrop.moving.style.position = "static";
        dragAndDrop.moving.style.left = "auto";
        dragAndDrop.moving.style.top = "auto";
        dragAndDrop.moving = false;
    }
    function onPage(x, y) {
        let top, right, bottom, left;
        top = dragAndDrop.mousey < Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) ? true : false;
        right = dragAndDrop.mousex < Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) ? true : false;
        bottom = y < 0 ? false : true;
        left = x < 0 ? false : true;
        if (top && right && bottom && left) return true;
        else return false;
    }
}