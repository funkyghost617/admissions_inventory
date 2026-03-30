async function fetchInventoryFromServer() {
    const response = await fetch("/inventory");
    const jsonResponse = await response.json();
    console.log(JSON.stringify(jsonResponse, null, 2));
    return JSON.parse(JSON.stringify(jsonResponse, null, 2));
}

async function fetchRequestsFromServer() {
    const response = await fetch("/requests");
    const jsonResponse = await response.json();
    console.log(JSON.stringify(jsonResponse, null, 2));
    return JSON.parse(JSON.stringify(jsonResponse, null, 2));
}

async function fetchRequestInfosFromServer(requestID = null) {
    const response = await fetch("/requestinfo/" + requestID);
    const jsonResponse = await response.json();
    console.log(JSON.stringify(jsonResponse, null, 2));
    return JSON.parse(JSON.stringify(jsonResponse, null, 2));
}

let currentInventory = await fetchInventoryFromServer();
let currentRequests = await fetchRequestsFromServer();
let currentRequestInfos = [];
currentRequests.forEach(async (item) => {
    let targetRequestInfo = await fetchRequestInfosFromServer(item.id);
    currentRequestInfos.push(targetRequestInfo);
    console.log(currentRequestInfos);
})

const inventoryCardsDiv = document.querySelector("#inventory-cards");
currentInventory.forEach(item => {
    const card = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = item.name;
    const quantity = document.createElement("p");
    quantity.textContent = `Total quantity: ${item.quantity}`;
    const location = document.createElement("p");
    location.textContent = `Location: ${item.location}`;

    card.append(name, quantity, location);
    inventoryCardsDiv.appendChild(card);
})

const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
};

const timeStartInput = document.querySelector("#time-start");
const currentTimeStart = document.querySelector("#current-time-start");
const timeEndInput = document.querySelector("#time-end");
const currentTimeEnd = document.querySelector("#current-time-end");
const dateTimeInfo = document.querySelector("#date-time-info");
timeStartInput.addEventListener("input", (e) => {
    currentTimeStart.textContent = new Date(timeStartInput.value).toLocaleString("en-US", options);
    if (timeStartInput.value >= timeEndInput.value) {
        dateTimeInfo.classList.add("date-time-error");
    } else {
        dateTimeInfo.classList.remove("date-time-error");
    }
})
timeStartInput.value = new Date().toISOString().slice(0, -8);
currentTimeStart.textContent = new Date(timeStartInput.value).toLocaleString("en-US", options);
timeEndInput.addEventListener("input", (e) => {
    currentTimeEnd.textContent = new Date(timeEndInput.value).toLocaleString("en-US", options);
    if (timeStartInput.value >= timeEndInput.value) {
        dateTimeInfo.classList.add("date-time-error");
    } else {
        dateTimeInfo.classList.remove("date-time-error");
    }
})
let defaultEndDateTime = new Date();
defaultEndDateTime.setDate(defaultEndDateTime.getDate() + 1);
timeEndInput.value = defaultEndDateTime.toISOString().slice(0, -8);
currentTimeEnd.textContent = new Date(timeEndInput.value).toLocaleString("en-US", options);