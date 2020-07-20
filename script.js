/* eslint-disable no-alert */

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  document.getElementById("coffee_counter").innerText=coffeeQty;
}

function clickCoffee(data) {
  data.coffee++;
  document.getElementById("coffee_counter").innerText=data.coffee;
  renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  producers.forEach(producer=>{
    if(coffeeCount>= producer.price/2) producer.unlocked=true;
  })
}

function getUnlockedProducers(data) {
  return data.producers.filter(producer=>producer.unlocked===true)
}

function makeDisplayNameFromId(id) {
  return id.split("_")
    .map(word=> word[0].toUpperCase()+word.slice(1))
    .join(" ")
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement('div');
  containerDiv.className = 'producer';
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <div class="flex">
    <button type="button" id="buy_${producer.id}">Buy</button>
    <button type="button" id="sell_${producer.id}">Sell</button>
    </div>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while(parent.childNodes.length>0){
    parent.removeChild(parent.lastChild)
  }
}

function renderProducers(data) {
  unlockProducers(data.producers, data.coffee);
  unlockedProducers=getUnlockedProducers(data);
  pContainer=document.getElementById("producer_container");

      deleteAllChildNodes(pContainer);
    unlockedProducers.forEach(i=>
      pContainer.appendChild(makeProducerDiv(i))
    )
  }


/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  return data.producers.filter(el=>el.id===producerId)[0]
}

function canAffordProducer(data, producerId) {
  return data.coffee>=getProducerById(data,producerId).price;
}

function updateCPSView(cps) {
  document.getElementById("cps").innerText=cps;
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice*1.25)
}

function attemptToBuyProducer(data, producerId) {
  const producer =getProducerById(data,producerId);
  const canAfford = canAffordProducer(data,producerId);

  if(canAfford){
    producer.qty++;
    data.coffee-=producer.price;
    producer.price=updatePrice(producer.price);
    data.totalCPS+=producer.cps;
  }

  return canAfford;
}

function buyButtonClick(event, data) {
  if(event.target.tagName==="BUTTON"){
    const producerClicked= event.target.id.slice(4)

    if(!canAffordProducer(data, producerClicked)){
      window.alert("Not enough coffee!");
    }
    else {
      attemptToBuyProducer(data,producerClicked);
      renderProducers(data);
      //setBackgrounds(data);
      updateCoffeeView(data.coffee);
      updateCPSView(data.totalCPS);
    }
  }
}

function sellButtonClick(event, data) {
  if(event.target.tagName==="BUTTON"){
    const producer= getProducerById(data,event.target.id.slice(5));

    if(producer.qty<1){
      window.alert("Nothing to sell!");
    }
    else {
      producer.qty--;
      data.coffee+=Math.ceil(producer.price/2);
      producer.price=Math.ceil(producer.price*.8);
      data.totalCPS-=producer.cps;
      renderProducers(data);
      updateCoffeeView(data.coffee);
      updateCPSView(data.totalCPS);
    }
  }
}


function tick(data) {
  for(let x=0;x<data.totalCPS;x++){clickCoffee(data);}
}

function saveGame(data){
 // console.log("saving");
  window.localStorage.setItem("STATE",JSON.stringify(data));
 // console.log(window.localStorage.getItem("STATE"));


}

function loadGame(data){
  console.log("loading data");

  const savedData=JSON.parse(window.localStorage.getItem("STATE"));

  data.coffee=savedData.coffee;
  data.totalCPS=savedData.totalCPS;
  data.producers=savedData.producers;

  updateCPSView(data.totalCPS);
  updateCoffeeView(data.coffee);
  renderProducers(data);

}

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === 'undefined') {
  // Get starting data from the window object
  // (This comes from data.js)

  let data = window.data;

  if(window.localStorage.getItem("STATE")){
    loadGame(data);
  }

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById('big_coffee');
  bigCoffee.addEventListener('click', () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById('producer_container');
  producerContainer.addEventListener('click', event => {
    if(event.target.tagName==="BUTTON"&&event.target.innerText==="Buy"){
    buyButtonClick(event, data);
    }
    if(event.target.tagName==="BUTTON"&&event.target.innerText==="Sell"){
      sellButtonClick(event, data);
    }
  });

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);

// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.

//save the game every 60 seconds
  setInterval(()=>saveGame(data),60000);
}
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick
  };
}
