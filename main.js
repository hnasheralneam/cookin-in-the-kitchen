// Variables
const pans = {
   pan1: false,
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
      isHere: false,
      joyLevel: 6,
      demands: [],
      spot: false
   },
   customer2: {
      isHere: false,
      joyLevel: 6,
      demands: [],
      spot: false
   },
   customer3: {
      isHere: false,
      joyLevel: 6,
      demands: [],
      spot: false
   },
   customer4: {
      isHere: false,
      joyLevel: 6,
      demands: [],
      spot: false
   },
   customer5: {
      isHere: false,
      joyLevel: 6,
      demands: [],
      spot: false
   },
}
const cashValues = {
   money: 0,
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
function allowDrop(e) { e.preventDefault(); }
function drag(e) { e.dataTransfer.setData("text", e.target.id); }
function drop(e) {
   e.preventDefault();
   let data = e.dataTransfer.getData("text");
   let incomer = document.querySelector(`#${data}`);
   // Steak
   if (incomer.dataset.foodtype === "steak") {
      // If in pan
      if (e.target.id.search("pan") !== -1) {
         // If pan is empty and steak is raw
         if (!pans[e.target.id] && incomer.dataset.iscooked == "false") {
            // Set pan as filled
            fill(pans[e.target.id], true);
            // Make steak visible and add to pan
            document.querySelector(`#${data}`).style.position = "static";
            document.querySelector(`#${data}`).style.opacity = "1";
            e.target.appendChild(incomer);
            // Start cooking steak
            startCooking("pan1", data);
         }
      }
      // If in plate & cooked
      if (plates[e.target.id] && incomer.dataset.iscooked == "true") {
         // If it is not already on plate
         if (!plates[e.target.id].includes(incomer.dataset.foodtype)) {
            // Empty the pan it came from
            fill(pans[incomer.parentElement.id], false);
            // Add steak to plate
            plates[e.target.id].push("steak");
            document.querySelector(`#${data}`).style.pointerEvents = "none";
            checkForOthers("steak");
            e.target.appendChild(incomer);
         }
      }
   }
   // Bread
   if (incomer.dataset.foodtype === "burgerBread") {
      // If it is not already in plate
      if (!plates[e.target.id].includes("burgerBread")) {
         // Add to plate
         plates[e.target.id].push("burgerBread");
         document.querySelector(`#${data}`).style.pointerEvents = "none";
         // Make visible
         document.querySelector(`#${data}`).style.position = "static";
         document.querySelector(`#${data}`).style.opacity = "1";
         // Put in plate
         checkForOthers("burgerBread");
         e.target.appendChild(incomer);
      }
   }
   // Customers
   if (e.target.id.search("customer") !== -1 && incomer.classList.contains("plate")) { customer(); }
   // Trsh Cn
   if (e.target.id === "trsh-cn") {
      if (incomer.classList.contains("plate")) { incomer.innerHTML = ""; plates[incomer.id] = []; }
      else { document.querySelector(`#${data}`).remove(); }
   }
   // Functions
   function checkForOthers(type) {
      if (type === "burgerBread" && plates[e.target.id].includes("steak")) { setAs("plainBurger"); }
      if (type === "steak" && plates[e.target.id].includes("burgerBread")) { setAs("plainBurger"); }
      function setAs(input) {
         document.getElementById(e.target.id).innerHTML = "";
         incomer.src = "Images/plain-burger.svg";
         plates[e.target.id] = [input];
      }
   }
   function customer() {
      let custNum = e.target.id.replace("customer", "");
      let returnValue;
      for (i = 0; i < custs[`customer${custNum}`]["demands"].length; i++) {
         if (plates[incomer.id].includes(custs[`customer${custNum}`]["demands"][i])) { returnValue = true; }
         else { return false; }
      }
      // If you have what they want, you are done
      if (returnValue) { clearCustomer(`customer${custNum}`, incomer); }
   }
}

// Time
setInterval(() => {
   if (!paused) TIME.lvlTime++;
   if (TIME.lvlTime === 8) { createCustomer(); }
   if (TIME.lvlTime === 14) { createCustomer(); createCustomer(); }
   if (TIME.lvlTime === 18) { createCustomer(); }
   if (TIME.lvlTime === 24) { createCustomer(); createCustomer(); createCustomer(); }
   if (TIME.lvlTime === 34) { createCustomer(); }
   // Other stuff
   document.querySelector(".playerMoney").textContent = `${cashValues.money}$`;
}, 1000);

function pause() { paused ? paused = false : paused = true; }

// Make new food items
function createNewSteak() {
   let newSteak = document.querySelector(".raw-steak-template").cloneNode();
   newSteak.style.pointerEvents = "auto";
   newSteak.setAttribute("id", `id-${Date.now()}`);
   editClass(newSteak, "raw-steak-template", "raw-steak");
   document.body.appendChild(newSteak);
}
function createNewBread() {
   let newBurgerBread = document.querySelector(".burger-bread-template").cloneNode();
   newBurgerBread.style.pointerEvents = "auto";
   newBurgerBread.setAttribute("id", `id-${Date.now()}`);
   editClass(newBurgerBread, "burger-steak-template", "burger-steak");
   document.body.appendChild(newBurgerBread);
}

// Start cooking
function startCooking(inPan, whichSteak) {
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
   if (!countertop.spot1) {
      let custImg = doBasic(1);
      let nextRun = 3000;
      let joyLoop = setInterval(() => {
         if (!paused) {
            if (nextRun === 0) { checkCustStatus(1, joyLoop, custImg); nextRun = 3000; }
            else { nextRun -= 100; }
         }
      }, 100);
   }
   else if (!countertop.spot2) {
      let custImg = doBasic(2);
      let nextRun = 3000;
      let joyLoop = setInterval(() => {
         if (!paused) {
            if (nextRun === 0) { checkCustStatus(2, joyLoop, custImg); nextRun = 3000; }
            else { nextRun -= 100; }
         }
      }, 100);
   }
   else if (!countertop.spot3) {
      let custImg = doBasic(3);
      let nextRun = 3000;
      let joyLoop = setInterval(() => {
         if (!paused) {
            if (nextRun === 0) { checkCustStatus(3, joyLoop, custImg); nextRun = 3000; }
            else { nextRun -= 100; }
         }
      }, 100);
   }
   else if (!countertop.spot4) {
      let custImg = doBasic(4);
      let nextRun = 3000;
      let joyLoop = setInterval(() => {
         if (!paused) {
            if (nextRun === 0) { checkCustStatus(4, joyLoop, custImg); nextRun = 3000; }
            else { nextRun -= 100; }
         }
      }, 100);
   }
   else if (!countertop.spot5) {
      let custImg = doBasic(5);
      let nextRun = 3000;
      let joyLoop = setInterval(() => {
         if (!paused) {
            if (nextRun === 0) { checkCustStatus(5, joyLoop, custImg); nextRun = 3000; }
            else { nextRun -= 100; }
         }
      }, 100);
   }
   else { waitingCustomers++; }
   // Functions
   function doBasic(num) {
      // Choose a spot for the customer and set them as here
      custs[`customer${num}`]["isHere"] = true
      custs[`customer${num}`]["spot"] = chooseSpot();
      countertop[custs[`customer${num}`]["spot"]] = true;
      // Choose customer image and set it
      let newCustomer = choosePerson();
      document.querySelector(`#customer${num}`).src = `Images/Customers/${newCustomer}/${custs[`customer${num}`]["joyLevel"]}.svg`;
      showObj(`#customer${num}`);
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
         // Set joy level image
         if (custs[`customer${num}`]["joyLevel"] >= 1) {
            document.querySelector(`#customer${num}`).src = `Images/Customers/${img}/${custs[`customer${num}`]["joyLevel"]}.svg`;
            custs[`customer${num}`]["joyLevel"]--;
         }
         else { clearUnhappyCustomer(`customer${num}`); clearInterval(theirLoop); }
      }
      else { clearInterval(theirLoop); }
   }
}

// Money
function checkMoney(num) {
   if (custs[`customer${num}`]["joyLevel"] === 6) { document.querySelector(`#money${num}`).src = `Images/Money/goldMoney.svg`; }
   if (custs[`customer${num}`]["joyLevel"] === 5) { document.querySelector(`#money${num}`).src = `Images/Money/silverMoney.svg`; }
   if (custs[`customer${num}`]["joyLevel"] === 4) { document.querySelector(`#money${num}`).src = `Images/Money/bronzeMoney.svg`; }
   if (custs[`customer${num}`]["joyLevel"] === 3) { document.querySelector(`#money${num}`).src = `Images/Money/goldCoin.svg`; }
   if (custs[`customer${num}`]["joyLevel"] === 2) { document.querySelector(`#money${num}`).src = `Images/Money/silverCoin.svg`; }
   if (custs[`customer${num}`]["joyLevel"] === 1) { document.querySelector(`#money${num}`).src = `Images/Money/bronzeCoin.svg`; }
}
function earnMoney(num) {
   let path = document.querySelector(`#money${num}`).src;
   let moneyTypeWorking = path.split("Images/Money/")[1];
   let moneyType = moneyTypeWorking.replace(".svg", "");
   cashValues.money += cashValues[moneyType];
   hideObj(`#money${num}`);
   countertop[`spot${num}`] = false;
   // If there is a customer waiting
   if (waitingCustomers > 0) { waitingCustomers -= 1; createCustomer(); }
}

// Choose information for customers
function choosePerson() {
   let person = ["b", "g", "p", "d"];
   return person[Math.floor(Math.random() * person.length)];
}
function chooseSpot() {
   if (!countertop.spot1) { return "spot1"; }
   else if (!countertop.spot2) { return "spot2"; }
   else if (!countertop.spot3) { return "spot3"; }
   else if (!countertop.spot4) { return "spot4"; }
   else if (!countertop.spot5) { return "spot5"; }
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
   custs[customer]["isHere"] = false;
   custs[customer]["joyLevel"] = 6;
   custs[customer]["spot"] = false;
   hideObj(`#${customer}`);
   hideObj(`#${customer}-demands`, true);
   // Only if unhappy customer
   if (ifTrue === undefined) {
      console.log(countertop[custs[customer]["spot"]]);
      countertop[custs[customer]["spot"]] = false;
      if (waitingCustomers > 0) { waitingCustomers -= 1; createCustomer(); }
   }
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

/*
// waiting customer spots not working
1.
~ play/pause animation
time for cooking set like VD plants so if paused start adding time then when unpaused add to original time

2.
~ More plates/pans
~ Save

3.
~ Levels (set orders/customers)
~ Map
~ end of level, 3 stars

4.
~ Walking customers
~ Tip jar, upgrade for happier customers

5.
~ option to click and place
~ other settings

6.
~ sauces and fries
~ burn steak

7.
~ popup saying how it goes

8.
~ Fixing what we will have messed up

9.
~ make another island
*/
