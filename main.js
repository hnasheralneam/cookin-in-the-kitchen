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
let time = 0;

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
   if (e.target.id.search("customer") !== -1 && incomer.classList.contains("plate")) {
      // If customer1
      if (e.target.id === "customer1") {
         let returnValue;
         for (i = 0; i < custs["customer1"]["demands"].length; i++) {
            if (plates[incomer.id].includes(custs["customer1"]["demands"][i])) { returnValue = true; }
            else { return false; }
         }
         // If you have what they want, you are done
         if (returnValue) { clearCustomer("customer1", incomer); }
      }
   }
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
}

// Time loop
setInterval(() => {
   time++;
   if (time === 8) { createCustomer(); }
   // Other stuff
   document.querySelector(".playerMoney").textContent = `${cashValues.money}$`;
}, 1000);

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
   setTimeout(() => {
      document.querySelector(`#${whichSteak}`).src = "Images/cooked-steak.svg";
      document.querySelector(`#${whichSteak}`).dataset.iscooked = true;
   }, 3000);
}

// Create customers
function createCustomer() {
   if (!countertop.spot1) {
      // Choose a spot for the customer and set them as here
      custs.customer1.isHere = true
      custs.customer1.spot = chooseSpot("customer1");
      countertop[custs.customer1.spot] = true;
      // Choose customer image and set it
      let newCustomer = choosePerson();
      document.querySelector("#customer1").src = `Images/Customers/${newCustomer}/${custs.customer1.joyLevel}.svg`;
      showObj("#customer1");
      // Give them demands and display their dreams
      custs.customer1.demands = createOrder(custs.customer1);
      if (custs.customer1.demands.includes("plainBurger")) { setDream("#customer1-demands", "plain-burger.svg"); }
      else if (custs.customer1.demands.includes("burgerBread")) { setDream("#customer1-demands", "burger-bread.svg"); }
      else if (custs.customer1.demands.includes("steak")) { setDream("#customer1-demands", "steak.svg"); }
      // Loop for joy
      let joyLoop = setInterval(() => {
         if (custs.customer1.demands !== "satiated") {
            if (custs.customer1.joyLevel >= 2) {
               // Set joy level image
               custs.customer1.joyLevel--;
               document.querySelector("#customer1").src = `Images/Customers/${newCustomer}/${custs.customer1.joyLevel}.svg`;
            }
            else { clearUnhappyCustomer("customer1"); clearInterval(joyLoop); }
         }
         else { clearInterval(joyLoop); }
      }, 3000); // 18 seconds
   }
   // Functions
   function setDream(dreamBox, dream) {
      showObj(dreamBox, true);
      document.querySelector(dreamBox).src = `Images/Dreams/${dream}`;
   }
   function createOrder(customer) {
      let order = [["plainBurger"], ["steak"], ["burgerBread"]];
      return order[Math.floor(Math.random() * order.length)];
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
}

// Choose information for customers
function choosePerson() {
   let person = ["b", "g", "p", "d"];
   return person[Math.floor(Math.random() * person.length)];
}
function chooseSpot(customer) {
   if (!countertop.spot1) { return "spot1"; }
   else if (!countertop.spot2) { return "spot2"; }
   else if (!countertop.spot3) { return "spot3"; }
   else if (!countertop.spot4) { return "spot4"; }
   else if (!countertop.spot5) { return "spot5"; }
   else { return "waiting"; }
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
   if (!ifTrue) { countertop[custs[customer]["spot"]] = false; }
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

// time for cooking set like Vegetable Dash plants so if paused start adding time then when unpaused add to original time
// level, with set customers and orders
// bread and sauces
// earn money
// pay for more plates/pans
// burn steak
// play/pause
// walking customers
// give money onclick, check type, pays up
