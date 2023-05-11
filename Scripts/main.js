// Variables
const pans = {
    pan1: false,
    pan2: false
}
const plates = {
    plate1: [],
}
const countertop = {
    spot1: false,
    spot2: false,
    spot3: false,
    spot4: false,
    spot5: false,
}
const custs = {
    customer1: {
        joyLevel: 6,
        demands: [],
        spot: false
    },
    customer2: {
        joyLevel: 6,
        demands: [],
        spot: false
    },
    customer3: {
        joyLevel: 6,
        demands: [],
        spot: false
    },
    customer4: {
        joyLevel: 6,
        demands: [],
        spot: false
    },
    customer5: {
        joyLevel: 6,
        demands: [],
        spot: false
    },
}
const cashValues = {
    money: 30,
    bronzeCoin: 10,
    silverCoin: 20,
    goldCoin: 30,
    bronzeMoney: 40,
    silverMoney: 45,
    goldMoney: 50
}
const TIME = {
    timePaused: 0,
    lvlTime: 0,
}
let waitingCustomers = 0;
let paused = false;

// Dropping
function dropped(element, target) {
    switch (element.dataset.foodtype) {
        case "steak":
            // If the target is a pan, it's empty, and the steak is raw
            if (target.classList.contains("pan") && !pans[target.id] && element.dataset.iscooked == "false") {
                // Fill pan
                fill(pans[target.id], true);
                // Add steak to pan, and start cooking
                target.appendChild(element);
                startCooking(element.id);
            }
            // If the target is a plate, and the steak is cooked
            if (plates[target.id] && element.dataset.iscooked == "true") {
                // If there isn't already steak on the plate
                if (!plates[target.id].includes(element.dataset.foodtype)) {
                    // Empty the pan from whence it came
                    fill(pans[element.parentElement.id], false);
                    // Add steak to the plate
                    plates[target.id].push("steak");
                    document.querySelector("#" + element.id).style.pointerEvents = "none";
                    checkForOthers("steak");
                    target.append(element);
                }
            }
            break;
        case "burgerBread":
            if (!plates[target.id].includes("burgerBread")) {
                // Add to plate
                plates[target.id].push("burgerBread");
                document.querySelector("#" + element.id).style.pointerEvents = "none";
                document.querySelector("#" + element.id).style.position = "static";
                // Put in plate
                checkForOthers("burgerBread");
                target.append(element);
            }
    }
    // Feeding customers
    if (target.classList.contains("customer") && element.classList.contains("plate")) {
        let custNum = target.id.replace("customer", "");
        let returnValue;
        for (i = 0; i < custs[`customer${custNum}`]["demands"].length; i++) {
            if (plates[element.id].includes(custs[`customer${custNum}`]["demands"][i])) returnValue = true;
            else {
                returnValue = false;
                break;
            }
        }
        // If you have what they want, "finish them"
        if (returnValue) clearCustomer(`customer${custNum}`, element);        
    }
    // Trsh Cn
    if (target.id == "trsh-cn") {
        if (incomer.classList.contains("plate")) {
            element.innerHTML = "";
            plates[element.id] = [];
        }
        else document.querySelector("#" + element.id).remove();
    }

    // Other functions
    function checkForOthers(type) {
        if (type === "burgerBread" && plates[target.id].includes("steak")) { setAs("plainBurger"); }
        if (type === "steak" && plates[target.id].includes("burgerBread")) { setAs("plainBurger"); }
        function setAs(input) {
            document.getElementById(target.id).innerHTML = "";
            element.src = "Images/plain-burger.svg";
            plates[target.id] = [input];
        }
    }
}

// Time
let gameProgression = setInterval(() => {
    if (!paused) TIME.lvlTime++;
    if (TIME.lvlTime === 6) { createCustomer(); }
    if (TIME.lvlTime === 14) { createCustomer(); createCustomer(); }
    if (TIME.lvlTime === 18) { createCustomer(); }
    if (TIME.lvlTime === 24) { createCustomer(); createCustomer(); createCustomer(); }
    if (TIME.lvlTime === 34) { createCustomer(); }
    // Other stuff
    document.querySelector(".playerMoney").textContent = `${cashValues.money}\$`;
}, 1000);
function pause() { paused = paused ? false : true; }

// Make new food items
function createNewSteak() {
    let newSteak = document.querySelector(".raw-steak-template").cloneNode();
    newSteak.style.pointerEvents = "auto";
    newSteak.style.opacity = "1";
    newSteak.setAttribute("id", `id-${Date.now()}`);
    editClass(newSteak, "raw-steak-template", "raw-steak");
    document.body.appendChild(newSteak);
}
function createNewBread() {
    let newBurgerBread = document.querySelector(".burger-bread-template").cloneNode();
    newBurgerBread.style.pointerEvents = "auto";
    newBurgerBread.style.opacity = "1";
    newBurgerBread.setAttribute("id", `id-${Date.now()}`);
    editClass(newBurgerBread, "burger-steak-template", "burger-steak");
    document.body.appendChild(newBurgerBread);
}

// Start cooking
function startCooking(whichSteak) {
    let cookingTimeLeft = 3000;
    let cookSteak = setInterval(() => {
        if (!paused) {
            cookingTimeLeft -= 100;
            if (cookingTimeLeft === 0) {
                document.querySelector(`#${whichSteak}`).src = "Images/cooked-steak.svg";
                document.querySelector(`#${whichSteak}`).dataset.iscooked = true;
                clearInterval(cookSteak);
            }
        }
    }, 100);
}

// Create customers
function createCustomer() {
    if (!countertop.spot1) doCustomerStuff(1);
    else if (!countertop.spot2) doCustomerStuff(2);
    else if (!countertop.spot3) doCustomerStuff(3);
    else if (!countertop.spot4) doCustomerStuff(4);
    else if (!countertop.spot5) doCustomerStuff(5);
    else waitingCustomers++;
    function doCustomerStuff(num) {
        let custImg = doBasic(num);
        let nextRun = 500;
        let joyLoop = setInterval(() => {
            if (!paused) {
                if (nextRun === 0) {
                    checkCustStatus(num, joyLoop, custImg);
                    nextRun = 3000;
                }
                else nextRun -= 100;
            }
        }, 100);
    }
    // Functions
    function doBasic(num) {
        showObj(`#customer${num}`);
        // Choose a spot for the customer and set them as here
        custs[`customer${num}`]["spot"] = chooseSpot();
        countertop[`spot${num}`] = true;
        // Choose customer image and set it
        let newCustomer = choosePerson();
        document.querySelector(`#customer${num}`).src = `Images/Customers/${newCustomer}/${custs[`customer${num}`]["joyLevel"]}.svg`;
        // Give them demands and display their dreams
        custs[`customer${num}`]["demands"] = createOrder(custs[`customer${num}`]);
        if (custs[`customer${num}`]["demands"].includes("plainBurger")) { setDream(`#customer${num}-demands`, "plain-burger.svg"); }
        else if (custs[`customer${num}`]["demands"].includes("burgerBread")) { setDream(`#customer${num}-demands`, "burger-bread.svg"); }
        else if (custs[`customer${num}`]["demands"].includes("steak")) { setDream(`#customer${num}-demands`, "steak.svg"); }
        // Give back customer image
        return newCustomer;
    }
    function setDream(dreamBox, dream) {
        showObj(dreamBox, true);
        document.querySelector(dreamBox).src = `Images/Dreams/${dream}`;
    }
    function createOrder(customer) {
        let order = [["plainBurger"], ["steak"], ["burgerBread"]];
        return order[Math.floor(Math.random() * order.length)];
    }
    function checkCustStatus(num, theirLoop, img) {
        if (custs[`customer${num}`]["demands"] !== "satiated") {
            if (custs[`customer${num}`]["joyLevel"] >= 1) {
                document.querySelector(`#customer${num}`).src = `Images/Customers/${img}/${custs[`customer${num}`]["joyLevel"]}.svg`;
                custs[`customer${num}`]["joyLevel"]--;
            }
            else { clearUnhappyCustomer(`customer${num}`); clearInterval(theirLoop); }
        }
        else clearInterval(theirLoop);
    }
    // Choose information for customers
    function choosePerson() {
        let person = ["b", "g", "p", "d"];
        return person[Math.floor(Math.random() * person.length)];
    }
    function chooseSpot() {
        if (!countertop.spot1) return "spot1";
        else if (!countertop.spot2) return "spot2";
        else if (!countertop.spot3) return "spot3";
        else if (!countertop.spot4) return "spot4";
        else if (!countertop.spot5) return "spot5";
    }
}

// Money
function checkMoney(num) {
    if (custs[`customer${num}`]["joyLevel"] === 6) document.querySelector(`#money${num}`).src = `Images/Money/goldMoney.svg`;
    if (custs[`customer${num}`]["joyLevel"] === 5) document.querySelector(`#money${num}`).src = `Images/Money/silverMoney.svg`;
    if (custs[`customer${num}`]["joyLevel"] === 4) document.querySelector(`#money${num}`).src = `Images/Money/bronzeMoney.svg`;
    if (custs[`customer${num}`]["joyLevel"] === 3) document.querySelector(`#money${num}`).src = `Images/Money/goldCoin.svg`;
    if (custs[`customer${num}`]["joyLevel"] === 2) document.querySelector(`#money${num}`).src = `Images/Money/silverCoin.svg`;
    if (custs[`customer${num}`]["joyLevel"] === 1) document.querySelector(`#money${num}`).src = `Images/Money/bronzeCoin.svg`;
}
function earnMoney(num) {
    let path = document.querySelector(`#money${num}`).src;
    let moneyTypeWorking = path.split("Images/Money/")[1];
    let moneyType = moneyTypeWorking.replace(".svg", "");
    cashValues.money += cashValues[moneyType];
    hideObj(`#money${num}`);
    countertop[`spot${num}`] = false;
    if (waitingCustomers > 0) { waitingCustomers -= 1; createCustomer(); }
}

// Clear customers
function clearCustomer(customer, plate) {
    plate.innerHTML = "";
    plates[plate.id] = [];
    custs[customer]["demands"] = "satiated";
    showObj(`#money${customer.match(/(\d+)/)[0]}`);
    checkMoney(customer.match(/(\d+)/)[0]);
    clearUnhappyCustomer(customer, true);
}
function clearUnhappyCustomer(customer, ifTrue) {
    custs[customer]["joyLevel"] = 6;
    hideObj(`#${customer}`);
    hideObj(`#${customer}-demands`, true);
    if (ifTrue === undefined) {
        let thisCustNum = customer.replace("customer", "");
        countertop[`spot${thisCustNum}`] = false;
        if (waitingCustomers > 0) { waitingCustomers -= 1; setTimeout(() => { createCustomer(); }, 250); }
    }
    custs[customer]["spot"] = "none";
}

// Helpful
function fill(what, toDo) { what = toDo; }
function editClass(toThis, remove, add) {
    toThis.classList.remove(remove);
    toThis.classList.add(add);
}
function hideObj(objId, parent) {
    document.querySelector(objId).style.opacity = "0";
    document.querySelector(objId).style.pointerEvents = "none";
    if (parent) {
        document.querySelector(objId).parentElement.style.opacity = "0";
        document.querySelector(objId).parentElement.style.pointerEvents = "none";
    }
}
function showObj(objId, parent) {
    document.querySelector(objId).style.opacity = "1";
    document.querySelector(objId).style.pointerEvents = "auto";
    if (parent) {
        document.querySelector(objId).parentElement.style.opacity = "1";
        document.querySelector(objId).parentElement.style.pointerEvents = "auto";
    }
}
