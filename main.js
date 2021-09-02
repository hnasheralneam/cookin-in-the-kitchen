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
const customers = {
   customer1: {
      isHere: false,
      joyLevel: 6,
      demands: [],
   },
   customer2: {
      isHere: false,
      joyLevel: 6,
      demands: [],
   },
   customer3: {
      isHere: false,
      joyLevel: 6,
      demands: [],
   },
   customer4: {
      isHere: false,
      joyLevel: 6,
      demands: [],
   },
   customer5: {
      isHere: false,
      joyLevel: 6,
      demands: [],
   },
}
const cashValues = {
   bronzeCoin: 10,
   silverCoin: 20,
   goldCoin: 30,
   bronzeMoney: 40,
   silverMoney: 45,
   goldMoney: 50
}

function allowDrop(e) { e.preventDefault(); }
function drag(e) { e.dataTransfer.setData("text", e.target.id); }

function drop(e) {
   e.preventDefault();
   let data = e.dataTransfer.getData("text");
   let incomer = document.querySelector(`#${data}`);
   // Customer
   if (e.target.id.search("customer") !== -1 && incomer.classList.contains("plate")) {
      if (e.target.id === "customer1") {
         let returnValue;
         for (i = 0; i < customers["customer1"]["demands"].length; i++) {
            if (plates[incomer.id].includes(customers["customer1"]["demands"][i])) { returnValue = true; }
            else { return false; }
         }
         if (returnValue) {
            incomer.innerHTML = "";
            customers.customer1.demands = "satiated";
         }
      }
   }
   // Steak in Pan
   if (e.target.id.search("pan") !== -1) {
      if (!pans[e.target.id] && incomer.dataset.iscooked == "false") {
         pans[e.target.id] = true;
         document.querySelector(`#${data}`).style.position = "static";
         document.querySelector(`#${data}`).style.opacity = "1";
         e.target.appendChild(incomer);
         startCooking("pan1", data);
      }
   }
   // Steak in Plate
   if (plates[e.target.id] && incomer.dataset.iscooked == "true") {
      if (!plates[e.target.id].includes(incomer.dataset.foodtype)) {
         plates[e.target.id].push("steak");
         document.querySelector(`#${data}`).style.position = "static";
         document.querySelector(`#${data}`).style.opacity = "1";
         e.target.appendChild(incomer);
      }
   }
   // Bread in Plate
   if (plates[e.target.id]) {
      if (!plates[e.target.id].includes("burgerBread") && incomer.dataset.foodtype === "burgerBread") {
         plates[e.target.id].push("burgerBread");
         document.querySelector(`#${data}`).style.position = "static";
         document.querySelector(`#${data}`).style.opacity = "1";
         if (plates[e.target.id].includes("steak")) {
            document.getElementById(e.target.id).innerHTML = "";
            e.target.appendChild(incomer);
            incomer.src = "Images/plain-burger.svg";
         }
         else { e.target.appendChild(incomer); }
      }
   }
   // Anything in Tras Can
   if (e.target.id === "trsh-cn") { document.querySelector(`#${data}`).remove(); }
}

function createNewSteak() {
   let newSteak = document.querySelector(".raw-steak-template").cloneNode();
   newSteak.style.pointerEvents = "auto";
   newSteak.setAttribute("id", `id-${Date.now()}`);
   newSteak.classList.remove("raw-steak-template");
   newSteak.classList.add("raw-steak");
   document.body.appendChild(newSteak);
}

function createNewBread() {
   let newBurgerBread = document.querySelector(".burger-bread-template").cloneNode();
   newBurgerBread.style.pointerEvents = "auto";
   newBurgerBread.setAttribute("id", `id-${Date.now()}`);
   newBurgerBread.classList.remove("burger-bread-template");
   newBurgerBread.classList.add("burger-bread");
   document.body.appendChild(newBurgerBread);
}

function startCooking(inPan, whichSteak) {
   setTimeout(() => {
      document.querySelector(`#${whichSteak}`).src = "Images/cooked-steak.svg";
      document.querySelector(`#${whichSteak}`).dataset.iscooked = true;
   }, 3000);
}

function createCustomer() {
   if (!customers.customer1.isHere) {
      customers.customer1.joyLevel = 6;
      let newCustomer = choosePerson();
      document.querySelector("#customer1").src = `Images/Customers/${newCustomer}/${customers.customer1.joyLevel}.svg`;
      document.querySelector("#customer1").style.display = "inline";
      customers.customer1.demands = createOrder(customers.customer1);
      console.log(customers.customer1.demands);
      let joyLoop = setInterval(() => {
         if (customers.customer1.demands !== "satiated") {
            if (customers.customer1.joyLevel >= 2) {
               customers.customer1.joyLevel--;
               document.querySelector("#customer1").src = `Images/Customers/${newCustomer}/${customers.customer1.joyLevel}.svg`;
            }
            else {
               document.querySelector("#customer1").style.pointerEvents = "none";
               document.querySelector("#customer1").style.opacity = "0";
               clearInterval(joyLoop);
            }
         }
         else {
            clearInterval(joyLoop);
            if (customers.customer1.joyLevel === 6) { document.querySelector("#money1").src = `Images/Money/goldMoney.svg`; }
            if (customers.customer1.joyLevel === 5) { document.querySelector("#money1").src = `Images/Money/silverMoney.svg`; }
            if (customers.customer1.joyLevel === 4) { document.querySelector("#money1").src = `Images/Money/bronzeMoney.svg`; }
            if (customers.customer1.joyLevel === 3) { document.querySelector("#money1").src = `Images/Money/goldCoin.svg`; }
            if (customers.customer1.joyLevel === 2) { document.querySelector("#money1").src = `Images/Money/silverCoin.svg`; }
            if (customers.customer1.joyLevel === 1) { document.querySelector("#money1").src = `Images/Money/bronzeCoin.svg`; }
         }
      }, 2500);
   }
}

function createOrder(customer) {
   let order = [["steak", "burgerBread"], ["steak"], ["burgerBread"]];
   return order[Math.floor(Math.random() * order.length)];
}

function choosePerson() {
   let person = ["b", "g", "p", "d"];
   return person[Math.floor(Math.random() * person.length)];
}

createCustomer();

// today GitHub!

// set pans and plates as empty as empty
// time for cooking set like Vegetable Dash plants so if paused start adding time then when unpaused add to original time
// level, with set customers and orders
// bread and sauces
// earn money
// pay for more plates/pans
// burn steak
// play/pause
// walking customers
