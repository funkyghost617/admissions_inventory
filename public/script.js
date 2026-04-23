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

let isTimingConflict = false;
function updateTimingConflict() {
  let isTimingConflictNow = false;
  currentRequests.forEach((request) => {
    const requestTimeStart = new Date(request["time_start"]);
    const requestTimeEnd = new Date(request["time_end"]);
    const inputTimeStart = new Date(timeStartInput.value);
    const inputTimeEnd = new Date(timeEndInput.value);
    if (
      (requestTimeStart > inputTimeStart && requestTimeStart < inputTimeEnd) ||
      (requestTimeEnd > inputTimeStart && requestTimeEnd < inputTimeEnd)
    ) {
      isTimingConflictNow = true;
    }
  });
  isTimingConflict = isTimingConflictNow;
  console.log(isTimingConflict);
}

function updateWithConflicts(invItem, quantityEle, selectAmountEle) {
  const selectedValue = Number(selectAmountEle.value);
  if (!isTimingConflict) {
    selectAmountEle.innerHTML = "";
    for (let i = 0; i <= invItem.quantity; i++) {
      const selectOption = document.createElement("option");
      selectOption.textContent = i;
      selectAmountEle.appendChild(selectOption);
    }
    selectAmountEle.value = selectedValue;
    quantityEle.textContent = `Total quantity: ${invItem.quantity}`;
    return;
  }

  console.log(currentRequestInfos);
  for (let i = 0; i < currentRequests.length; i++) {
    const requestInfoArray = currentRequestInfos[`request_${i}`];
    for (let j = 0; j < requestInfoArray.length; j++) {
      let infoObj = requestInfoArray[j];
      if (invItem.id == infoObj["item_id"]) {
        let newAvailableQuantity =
          selectAmountEle.childNodes.length - 1 - infoObj["quantity"];
        if (newAvailableQuantity < 0) {
          newAvailableQuantity = 0;
        }
        selectAmountEle.innerHTML = "";
        for (let i = 0; i <= newAvailableQuantity; i++) {
          const selectOption = document.createElement("option");
          selectOption.textContent = i;
          selectAmountEle.appendChild(selectOption);
        }
        if (selectedValue <= newAvailableQuantity) {
          selectAmountEle.value = selectedValue;
        } else {
          selectAmountEle.value = newAvailableQuantity;
        }
        quantityEle.textContent = `Total quantity: ${invItem.quantity} (${newAvailableQuantity} available during requested timeframe)`;
      }
    }
  }
}

let currentInventory;
let currentRequests = await fetchRequestsFromServer();
let currentRequestInfos = {};
for (let i = 0; i < currentRequests.length; i++) {
  let targetRequestInfo = await fetchRequestInfosFromServer(
    currentRequests[0].id,
  );
  currentRequestInfos[`request_${i}`] = targetRequestInfo;
}
console.log(currentRequestInfos);
updateTimingConflict();

const tagsDiv = document.querySelector("#inventory-tags");
let tagsArray = [];

const inventoryCardsDiv = document.querySelector("#inventory-cards");
async function populateInventoryCards(sort = "name") {
  currentInventory = await fetchInventoryFromServer(sort);
  inventoryCardsDiv.innerHTML = "";
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
    for (let i = 0; i <= item.quantity; i++) {
      const selectOption = document.createElement("option");
      selectOption.textContent = i;
      selectAmount.appendChild(selectOption);
    }

    updateWithConflicts(item, quantity, selectAmount);
    timeStartInput.addEventListener("change", (e) => {
      updateTimingConflict();
      updateWithConflicts(item, quantity, selectAmount);
    });

    const tags = document.createElement("p");
    const itemTagsArray = item.tags;
    if (itemTagsArray != null) {
      itemTagsArray.forEach((tag) => {
        card.classList.add(tag.replace(" ", "_"));
        if (!tagsArray.includes(tag.replace(" ", "_"))) {
          tagsArray.push(tag.replace(" ", "_"));
        }
      });
    } else {
      card.classList.add("no_tags");
    }

    tags.textContent = `Tags: ${itemTagsArray == null ? "no tags" : itemTagsArray}`;

    card.append(name, image, location, quantity, selectAmount, tags);
    inventoryCardsDiv.appendChild(card);
  });
  updateVisibleItems();
}
await populateInventoryCards();

tagsArray.sort();
tagsArray.push("no_tags");
tagsDiv.innerHTML = "";
for (let i = 0; i < tagsArray.length; i++) {
  const label = document.createElement("label");
  label.setAttribute("for", tagsArray[i]);
  const input = document.createElement("input");
  input.setAttribute("id", tagsArray[i]);
  input.setAttribute("type", "checkbox");
  const span = document.createElement("span");
  span.textContent = ` ${tagsArray[i].replace("_", " ")}`;
  label.append(input, span);
  tagsDiv.append(label);
}
tagsDiv.addEventListener("change", (e) => {
  updateVisibleItems();
});

const selectAllBtn = document.createElement("button");
selectAllBtn.setAttribute("type", "button");
selectAllBtn.textContent = "select all";
const deselectAllBtn = document.createElement("button");
deselectAllBtn.setAttribute("type", "button");
deselectAllBtn.textContent = "deselect all";
tagsDiv.append(selectAllBtn, deselectAllBtn);

const allTagInputs = document.querySelectorAll("#inventory-tags input");
selectAllBtn.addEventListener("click", (e) => {
  allTagInputs.forEach((tagInput) => {
    tagInput.checked = true;
  });
  updateVisibleItems();
});
deselectAllBtn.addEventListener("click", (e) => {
  allTagInputs.forEach((tagInput) => {
    tagInput.checked = false;
  });
  updateVisibleItems();
});
selectAllBtn.click();

const nameInput = document.querySelector("#name");
nameInput.value = "";
const emailInput = document.querySelector("#email");
emailInput.value = "";
const notesInput = document.querySelector("textarea");
notesInput.value = "";

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
    notes: notesInput.value,
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

const inventorySortNameBtn = document.querySelector("#sort-inventory-name-btn");
const inventorySortLocationBtn = document.querySelector(
  "#sort-inventory-location-btn",
);
inventorySortNameBtn.classList.add("selected");
inventorySortNameBtn.addEventListener("click", async (e) => {
  if (inventorySortNameBtn.classList.contains("selected")) {
    return;
  } else {
    inventorySortNameBtn.classList.add("loading");
    inventorySortLocationBtn.classList.remove("selected");
    await populateInventoryCards("name");
    inventorySortNameBtn.classList.remove("loading");
    inventorySortNameBtn.classList.add("selected");
  }
});
inventorySortLocationBtn.addEventListener("click", async (e) => {
  if (inventorySortLocationBtn.classList.contains("selected")) {
    return;
  } else {
    inventorySortLocationBtn.classList.add("loading");
    inventorySortNameBtn.classList.remove("selected");
    await populateInventoryCards("location");
    inventorySortLocationBtn.classList.remove("loading");
    inventorySortLocationBtn.classList.add("selected");
  }
});

function updateVisibleItems() {
  const allItemCards = document.querySelectorAll("#inventory-cards > div");
  console.log(allItemCards.length);
  console.log(tagsArray);
  const allTagInputs = document.querySelectorAll("#inventory-tags input");
  let visibleTagInputs = [];
  allTagInputs.forEach((tagInput) => {
    if (tagInput.checked) {
      visibleTagInputs.push(tagInput.getAttribute("id"));
    }
  });
  allItemCards.forEach((itemCard) => {
    let hasVisibleTag = false;
    for (let i = 0; i < tagsArray.length; i++) {
      if (
        itemCard.classList.contains(tagsArray[i]) &&
        visibleTagInputs.includes(tagsArray[i])
      ) {
        hasVisibleTag = true;
      }
    }
    if (hasVisibleTag) {
      console.log(itemCard.getAttribute("item-id") + " is visible!");
      itemCard.classList.remove("hidden-item");
      itemCard.classList.add("visible-item");
    } else {
      console.log(itemCard.getAttribute("item-id") + " is hidden!");
      itemCard.classList.remove("visible-item");
      itemCard.classList.add("hidden-item");
    }
  });
}
