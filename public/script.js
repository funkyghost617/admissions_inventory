async function fetchInventoryFromServer(sort = "name") {
  const response = await fetch("/inventory/" + sort);
  const jsonResponse = await response.json();
  console.log(JSON.stringify(jsonResponse, null, 2));
  return JSON.parse(JSON.stringify(jsonResponse, null, 2));
}

async function fetchRequestsFromServer() {
  const response = await fetch("/requests/approved");
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
});

const inventoryCardsDiv = document.querySelector("#inventory-cards");
currentInventory.forEach((item) => {
  const card = document.createElement("div");
  const name = document.createElement("h3");
  name.textContent = item.name;
  const image = document.createElement("img");
  image.setAttribute("src", item.image_link);
  const location = document.createElement("p");
  location.textContent = `Location: ${item.location}`;
  const quantity = document.createElement("p");
  quantity.textContent = `Total quantity: ${item.quantity}`;
  const selectAmount = document.createElement("select");
  selectAmount.setAttribute("item-id", item.id);
  for (let i = 0; i < item.quantity + 1; i++) {
    const selectOption = document.createElement("option");
    selectOption.textContent = i;
    selectAmount.appendChild(selectOption);
  }

  card.append(name, image, location, quantity, selectAmount);
  inventoryCardsDiv.appendChild(card);
});

const options = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

const timeStartInput = document.querySelector("#time-start");
const currentTimeStart = document.querySelector("#current-time-start");
const timeEndInput = document.querySelector("#time-end");
const currentTimeEnd = document.querySelector("#current-time-end");
const dateTimeInfo = document.querySelector("#date-time-info");
timeStartInput.addEventListener("input", (e) => {
  currentTimeStart.textContent = new Date(timeStartInput.value).toLocaleString(
    "en-US",
    options,
  );
  if (timeStartInput.value >= timeEndInput.value) {
    dateTimeInfo.classList.add("date-time-error");
  } else {
    dateTimeInfo.classList.remove("date-time-error");
  }
});
timeStartInput.value = new Date().toISOString().slice(0, -8);
currentTimeStart.textContent = new Date(timeStartInput.value).toLocaleString(
  "en-US",
  options,
);
timeEndInput.addEventListener("input", (e) => {
  currentTimeEnd.textContent = new Date(timeEndInput.value).toLocaleString(
    "en-US",
    options,
  );
  if (timeStartInput.value >= timeEndInput.value) {
    dateTimeInfo.classList.add("date-time-error");
  } else {
    dateTimeInfo.classList.remove("date-time-error");
  }
});
let defaultEndDateTime = new Date();
defaultEndDateTime.setDate(defaultEndDateTime.getDate() + 1);
timeEndInput.value = defaultEndDateTime.toISOString().slice(0, -8);
currentTimeEnd.textContent = new Date(timeEndInput.value).toLocaleString(
  "en-US",
  options,
);

const nameInput = document.querySelector("#name");
nameInput.value = "";
const emailInput = document.querySelector("#email");
emailInput.value = "";

const itemQuantitySelectors = document.querySelectorAll(
  "#inventory-cards select",
);

const submitBtn = document.querySelector("#submit-btn");
submitBtn.addEventListener("click", async (e) => {
  let isAllZeros = true;
  itemQuantitySelectors.forEach((selector) => {
    if (selector.value != 0) {
      isAllZeros = false;
    }
  });
  if (isAllZeros) {
    alert("Must request at least one item");
    return;
  } else if (nameInput.value == "") {
    alert("Must enter name");
    return;
  } else if (emailInput.value == "" || !/^.+@.+$/.test(emailInput.value)) {
    alert("Must enter valid email");
    return;
  } else if (dateTimeInfo.classList.contains("date-time-error")) {
    alert("Must enter valid date range");
    return;
  } else {
    console.log("passed form validation\ncontinuing request submission");
  }

  const requestObj = {
    name: nameInput.value,
    email: emailInput.value,
    time_start: timeStartInput.value,
    time_end: timeEndInput.value,
  };

  let requestInfoArray = [];
  itemQuantitySelectors.forEach((selector) => {
    if (selector.value != 0) {
      const infoObj = {
        item_id: selector.getAttribute("item-id"),
        quantity: selector.value,
      };
      requestInfoArray.push(infoObj);
    }
  });

  const fullObj = { request: requestObj, request_info: requestInfoArray };

  const request = await fetch("/submitrequest/" + JSON.stringify(fullObj));
  const response = await request.json();
  console.log(response);
  const printRequestLinkAnchor = document.querySelector("#print-request-link");
  printRequestLinkAnchor.setAttribute("href", "/pdf/request/" + response);
  modalBox.showModal();
});

const modalBox = document.querySelector("#modal-box");
