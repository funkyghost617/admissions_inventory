const options = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordPage = document.querySelector("#password-page");
passwordInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    let isMatch = false;
    emailInput.disabled = true;
    passwordInput.disabled = true;
    const loginObj = {
      email: emailInput.value,
      password: passwordInput.value,
    };
    const request = await fetch("/submitadminlogin", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(loginObj),
    }).then(async (response) => {
      const responseData = await response.json();
      console.log(responseData);
      if (!responseData.__isAuthError) {
        isMatch = true;
      }
    });
    if (isMatch) {
      passwordPage.classList.add("successful");
      populateInventoryCards();
      populateRequestCards();
    } else {
      emailInput.value = "";
      passwordInput.value = "";
      emailInput.disabled = false;
      passwordInput.disabled = false;
      alert("Incorrect login");
    }
  } else {
    return;
  }
});
emailInput.addEventListener("keydown", async (e) => {
  //currently copied directly from above
  if (e.key === "Enter") {
    let isMatch = false;
    const loginObj = {
      email: emailInput.value,
      password: passwordInput.value,
    };
    emailInput.disabled = true;
    passwordInput.disabled = true;
    const request = await fetch("/submitadminlogin", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(loginObj),
    }).then(async (response) => {
      const responseData = await response.json();
      console.log(responseData);
      if (!responseData.__isAuthError) {
        isMatch = true;
      }
    });
    if (isMatch) {
      passwordPage.classList.add("successful");
      populateInventoryCards();
      populateRequestCards();
    } else {
      emailInput.value = "";
      passwordInput.value = "";
      emailInput.disabled = false;
      passwordInput.disabled = false;
      alert("Incorrect login");
    }
  } else {
    return;
  }
});

populateInventoryCards();
populateRequestCards();

async function fetchInventoryFromServer(sort) {
  const response = await fetch("/inventory/" + sort);
  const jsonResponse = await response.json();
  console.log(JSON.stringify(jsonResponse, null, 2));
  return JSON.parse(JSON.stringify(jsonResponse, null, 2));
}

async function fetchRequestsFromServer(status = "needs_approval") {
  const response = await fetch("/requests/" + status);
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

async function fetchInventoryItemFromServer(itemID) {
  const response = await fetch("/getinventoryitem/" + String(itemID));
  const jsonResponse = await response.json();
  console.log(JSON.stringify(jsonResponse, null, 2));
  return JSON.parse(JSON.stringify(jsonResponse, null, 2));
}

let currentInventory;
const tagsDiv = document.querySelector("#inventory-tags");
let tagsArray = [];

const modalBox = document.querySelector("#modal-box");
const inventoryCardsDiv = document.querySelector("#inventory-cards");
async function populateInventoryCards(sort = "name") {
  currentInventory = await fetchInventoryFromServer(sort);
  inventoryCardsDiv.innerHTML = "";

  currentInventory.forEach((item) => {
    const card = document.createElement("div");
    card.setAttribute("item-id", item.id);
    const name = document.createElement("h3");
    name.textContent = item.name;
    const image = document.createElement("img");
    image.setAttribute("src", item.image_link);
    const location = document.createElement("p");
    location.textContent = `Location: ${item.location}`;
    const quantity = document.createElement("p");
    quantity.textContent = `Total quantity: ${item.quantity}`;
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

    card.append(name, image, location, quantity, tags);
    inventoryCardsDiv.appendChild(card);

    card.addEventListener("click", (e) => {
      const modalTitle = document.createElement("h2");
      modalTitle.textContent = "Item info";
      modalBox.append(modalTitle);

      const nameInput = document.createElement("input");
      nameInput.setAttribute("type", "text");
      nameInput.setAttribute("placeholder", "Item name");
      nameInput.value = name.textContent;
      const imgEx = document.createElement("img");
      imgEx.setAttribute("src", item.image_link);
      const imgHref = document.createElement("input");
      imgHref.setAttribute("type", "text");
      imgHref.setAttribute("placeholder", "Image link");
      imgHref.value = image.getAttribute("src");
      imgHref.addEventListener("change", (e) => {
        imgEx.setAttribute("src", imgHref.value);
      });
      const locationInput = document.createElement("input");
      locationInput.setAttribute("type", "text");
      locationInput.setAttribute("placeholder", "Location");
      locationInput.value = location.textContent.split(": ")[1];
      const quantityInput = document.createElement("input");
      quantityInput.setAttribute("type", "text");
      quantityInput.setAttribute("placeholder", "Quantity");
      quantityInput.value = quantity.textContent.split(": ")[1];

      const currentTagsDiv = document.createElement("div");
      currentTagsDiv.setAttribute("id", "current-tags-div");
      currentTagsDiv.textContent = "Current tags: ";
      let currentTagsArray = [];
      card.classList.values().forEach((value) => {
        if (value != "visible-item" && value != "hidden-item") {
          currentTagsArray.push(value);
        }
      });
      console.log(currentTagsArray);
      for (let i = 0; i < currentTagsArray.length; i++) {
        const span = document.createElement("span");
        span.textContent = currentTagsArray[i].replace("_", " ");
        currentTagsDiv.appendChild(span);
        if (currentTagsArray[i] != "no_tags") {
          span.addEventListener("click", (e) => {
            if (
              confirm(
                `Are you sure you want to delete the "${currentTagsArray[i].replace("_", "")}"" tag from this item?`,
              )
            ) {
              span.remove();
              submitBtn.disabled = false;
            }
          });
        }
      }
      const addNewTag = document.createElement("span");
      addNewTag.textContent = "add +";
      addNewTag.setAttribute("id", "add-new-tag-span");
      addNewTag.addEventListener("click", (e) => {
        let newTagString = prompt(
          "Enter the tag you'd like to add to this item",
        );
        if (currentTagsArray.includes(newTagString.replace(" ", "_"))) {
          alert(`Item already has the "${newTagString}" tag`);
        } else {
          const span = document.createElement("span");
          span.textContent = newTagString;
          addNewTag.insertAdjacentElement("beforebegin", span);
          submitBtn.disabled = false;
          span.addEventListener("click", (e) => {
            if (
              confirm(
                `Are you sure you want to delete the "${newTagString}" tag from this item?`,
              )
            ) {
              span.remove();
            }
          });
        }
      });
      currentTagsDiv.appendChild(addNewTag);
      modalBox.append(
        nameInput,
        imgEx,
        imgHref,
        locationInput,
        quantityInput,
        currentTagsDiv,
      );
      const detectForSubmitEnable = [
        nameInput,
        imgEx,
        imgHref,
        locationInput,
        quantityInput,
      ];
      detectForSubmitEnable.forEach((element) => {
        element.addEventListener("change", (e) => {
          submitBtn.disabled = false;
        });
      });

      const btnDiv = document.createElement("div");
      const deleteBtn = document.createElement("button");
      deleteBtn.setAttribute("type", "button");
      deleteBtn.textContent = "delete";
      const cancelBtn = document.createElement("button");
      cancelBtn.setAttribute("type", "button");
      cancelBtn.textContent = "cancel";
      const submitBtn = document.createElement("button");
      submitBtn.setAttribute("type", "button");
      submitBtn.textContent = "save";
      btnDiv.append(deleteBtn, cancelBtn, submitBtn);
      modalBox.append(btnDiv);
      submitBtn.disabled = true;

      modalBox.setAttribute("class", "inventory-modal");
      modalBox.showModal();

      deleteBtn.addEventListener("click", async (e) => {
        const isConfirmed = confirm(
          "Are you sure you want to delete this item? This is irreversible",
        );
        if (isConfirmed) {
          const response = await fetch(
            "/deleteinventoryitem/" + card.getAttribute("item-id"),
          );
          const jsonResponse = await response.json();
          console.log(JSON.stringify(jsonResponse, null, 2));
          card.remove();
          modalBox.close();
          modalBox.innerHTML = "";
        } else {
          return;
        }
      });
      cancelBtn.addEventListener("click", (e) => {
        modalBox.close();
        modalBox.innerHTML = "";
      });
      submitBtn.addEventListener("click", async (e) => {
        if (nameInput.value == "") {
          alert("Item must have a name");
          return;
        } else if (quantityInput.value == "") {
          alert("Item must have a quantity");
          return;
        }
        nameInput.disabled = true;
        imgHref.disabled = true;
        locationInput.disabled = true;
        quantityInput.disabled = true;
        cancelBtn.disabled = true;
        submitBtn.disabled = true;
        let updatedTagsArray = [];
        const updatedTagSpans = document.querySelectorAll(
          "#current-tags-div > span:not(:last-child)",
        );
        if (
          updatedTagSpans.length == 1 &&
          updatedTagSpans[0].textContent == "no tags"
        ) {
          updatedTagsArray = null;
        } else {
          updatedTagSpans.forEach((span) => {
            updatedTagsArray.push(span.textContent);
          });
        }
        const newItemObj = {
          name: nameInput.value,
          location: locationInput.value,
          quantity: Number(quantityInput.value),
          image_link: imgHref.value,
          tags: updatedTagsArray,
        };
        const fullRequestObj = {
          requestObj: newItemObj,
          id: Number(card.getAttribute("item-id")),
        };
        const request = await fetch("/submitinventoryupdate", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(fullRequestObj),
        }).then((response) => {
          console.log(response);
        });
        modalBox.close();
        name.textContent = nameInput.value;
        location.textContent = `Location: ${locationInput.value}`;
        image.setAttribute("src", imgHref.value);
        quantity.textContent = `Total quantity: ${quantityInput.value}`;
        tags.textContent = `Tags: ${updatedTagsArray == [] ? "no tags" : updatedTagsArray}`;
        card.classList.values().forEach((value) => {
          if (value != "visible-item" && value != "hidden-item") {
            card.classList.remove(value);
          }
        });
        if (updatedTagsArray == []) {
          card.classList.add("no_tags");
        } else {
          const currentTagCheckboxes = document.querySelectorAll(
            "#inventory-tags input",
          );
          let currentTagArray = [];
          currentTagCheckboxes.forEach((checkbox) => {
            currentTagArray.push(checkbox.getAttribute("id").replace("_", " "));
          });
          updatedTagsArray.forEach((updatedTag) => {
            card.classList.add(updatedTag.replace(" ", "_"));
            if (!currentTagArray.includes(updatedTag)) {
              const noTagCheckbox = document.querySelector(
                'label[for="no_tags"',
              );
              const label = document.createElement("label");
              label.setAttribute("for", updatedTag.replace(" ", "_"));
              const input = document.createElement("input");
              input.setAttribute("type", "checkbox");
              input.setAttribute("id", updatedTag.replace(" ", "_"));
              const span = document.createElement("span");
              span.textContent = updatedTag;
              label.append(input, span);
              noTagCheckbox.insertAdjacentElement("beforebegin", label);
            }
          });
        }
        updateVisibleItems();
        modalBox.innerHTML = "";
      });
    });
  });

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

  const addNewItem = document.createElement("div");
  const addNewItemPara = document.createElement("p");
  addNewItemPara.textContent = "add new item";
  addNewItem.append(addNewItemPara);
  inventoryCardsDiv.append(addNewItem);
  selectAllBtn.click();
  addNewItem.addEventListener("click", (e) => {
    const modalTitle = document.createElement("h2");
    modalTitle.textContent = "Add an item to inventory";
    modalBox.append(modalTitle);

    const nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("placeholder", "Item name");
    const imgEx = document.createElement("img");
    const imgHref = document.createElement("input");
    imgHref.setAttribute("type", "text");
    imgHref.setAttribute("placeholder", "Image link");
    imgHref.addEventListener("change", (e) => {
      imgEx.setAttribute("src", imgHref.value);
    });
    const locationInput = document.createElement("input");
    locationInput.setAttribute("type", "text");
    locationInput.setAttribute("placeholder", "Location");
    const quantityInput = document.createElement("input");
    quantityInput.setAttribute("type", "text");
    quantityInput.setAttribute("placeholder", "Quantity");
    const tagMessage = document.createElement("p");
    tagMessage.textContent =
      "You will be able to add tags to item after creation";
    modalBox.append(
      nameInput,
      imgEx,
      imgHref,
      locationInput,
      quantityInput,
      tagMessage,
    );

    const btnDiv = document.createElement("div");
    const cancelBtn = document.createElement("button");
    cancelBtn.setAttribute("type", "button");
    cancelBtn.textContent = "cancel";
    const submitBtn = document.createElement("button");
    submitBtn.setAttribute("type", "button");
    submitBtn.textContent = "submit";
    btnDiv.append(cancelBtn, submitBtn);
    modalBox.append(btnDiv);

    modalBox.setAttribute("class", "inventory-modal");
    modalBox.showModal();

    cancelBtn.addEventListener("click", (e) => {
      modalBox.close();
      modalBox.innerHTML = "";
    });
    submitBtn.addEventListener("click", async (e) => {
      if (nameInput.value == "") {
        alert("Item must have a name");
        return;
      } else if (quantityInput.value == "") {
        alert("Item must have a quantity");
        return;
      }
      nameInput.disabled = true;
      imgHref.disabled = true;
      locationInput.disabled = true;
      quantityInput.disabled = true;
      cancelBtn.disabled = true;
      submitBtn.disabled = true;
      const newItemObj = {
        name: nameInput.value,
        location: locationInput.value,
        quantity: Number(quantityInput.value),
        image_link: imgHref.value,
      };
      const fullRequestObj = {
        requestObj: newItemObj,
      };
      let newItemID;
      const request = await fetch("/submitnewinventoryitem", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(fullRequestObj),
      }).then((response) => {
        console.log(response.message);
        newItemID = response.id;
      });
      modalBox.close();

      const card = document.createElement("div");
      card.setAttribute("item-id", newItemID);
      const name = document.createElement("h3");
      name.textContent = nameInput.value;
      const image = document.createElement("img");
      image.setAttribute("src", imgHref.value);
      const location = document.createElement("p");
      location.textContent = `Location: ${locationInput.value}`;
      const quantity = document.createElement("p");
      quantity.textContent = `Total quantity: ${quantityInput.value}`;

      card.append(name, image, location, quantity);
      addNewItem.insertAdjacentElement("beforebegin", card);

      modalBox.innerHTML = "";
    });
  });
}

function updateVisibleItems() {
  const allItemCards = document.querySelectorAll(
    "#inventory-cards > div:not(:last-child)",
  );
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

const inventoryBtn = document.querySelector("#inventory-btn");
const inventorySectionToHide = document.querySelector(
  "#inventory-section-to-hide",
);
inventoryBtn.addEventListener("click", (e) => {
  if (inventorySectionToHide.classList.contains("hidden")) {
    inventorySectionToHide.classList.remove("hidden");
    inventoryBtn.textContent = "hide section";
  } else {
    inventorySectionToHide.classList.add("hidden");
    inventoryBtn.textContent = "show section";
  }
});

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

let currentRequests;

const requestCardsTableBody = document.querySelector("#request-table > tbody");
async function populateRequestCards(status) {
  currentRequests = await fetchRequestsFromServer(status);
  requestCardsTableBody.innerHTML = "";
  currentRequests.forEach(async (item) => {
    const row = document.createElement("tr");
    row.setAttribute("request-id", item.id);
    const requestCreated = document.createElement("td");
    requestCreated.textContent = item.created_at.split("T")[0];
    const requesterName = document.createElement("td");
    requesterName.textContent = item.name;
    const requesterEmail = document.createElement("td");
    requesterEmail.textContent = item.email;
    const requestTimeStart = document.createElement("td");
    requestTimeStart.textContent = item.time_start;
    const requestTimeEnd = document.createElement("td");
    requestTimeEnd.textContent = item.time_end;
    const requestStatus = document.createElement("td");
    requestStatus.textContent = item.status;

    row.append(
      requestCreated,
      requesterName,
      requesterEmail,
      requestTimeStart,
      requestTimeEnd,
      requestStatus,
    );
    requestCardsTableBody.appendChild(row);

    row.addEventListener("click", async (e) => {
      let targetRequestInfo = JSON.parse(
        JSON.stringify(await fetchRequestInfosFromServer(item.id)),
      );
      const modalTitle = document.createElement("h2");
      modalTitle.textContent = "Request info";
      modalBox.append(modalTitle);

      modalBox.setAttribute("class", "request-modal");
      modalBox.showModal();

      for (let i = 0; i < targetRequestInfo.length; i++) {
        let info = targetRequestInfo[i];
        const itemCard = document.createElement("div");
        const itemDataFetch = await fetchInventoryItemFromServer(info.item_id);
        const itemData = itemDataFetch[0];
        console.log(itemData);
        const itemImgDiv = document.createElement("div");
        const itemImg = document.createElement("img");
        itemImg.setAttribute("src", itemData.image_link);
        itemImgDiv.append(itemImg);
        const itemName = document.createElement("p");
        itemName.textContent = itemData.name;
        const itemLoca = document.createElement("p");
        itemLoca.textContent = `(${itemData.location})`;
        const itemRequestQuantity = document.createElement("p");
        let availableQuantity = itemData.quantity;
        if (item.status != "approved") {
          const approvedRequests = await fetchRequestsFromServer("approved");
          const currentRequestTimeStart = new Date(item.time_start);
          const currentRequestTimeEnd = new Date(item.time_end);
          approvedRequests.forEach(async (requestItem) => {
            const testTimeStart = new Date(requestItem.time_start);
            const testTimeEnd = new Date(requestItem.time_end);
            const isTimingConflict =
              (currentRequestTimeStart > testTimeStart &&
                currentRequestTimeStart < testTimeEnd) ||
              (currentRequestTimeEnd > testTimeStart &&
                currentRequestTimeEnd < testTimeEnd);
            console.log(isTimingConflict);
            if (isTimingConflict) {
              const relevantRequestInfos = JSON.parse(
                JSON.stringify(
                  await fetchRequestInfosFromServer(requestItem.id),
                ),
              );
              const relevantItem = relevantRequestInfos.find(
                (element) => element.item_id == itemData.id,
              );
              if (relevantItem != undefined) {
                console.log("there is a relevant item!");
                console.log(availableQuantity);
                availableQuantity -= relevantItem.quantity;
                if (availableQuantity < info.quantity) {
                  itemRequestQuantity.textContent = `Count: ${info.quantity} (only ${availableQuantity} available during requested time)`;
                  itemRequestQuantity.classList.add("unavailable-quantity");
                } else {
                  itemRequestQuantity.textContent = `Count: ${info.quantity}`;
                }
              } else {
                itemRequestQuantity.textContent = `Count: ${info.quantity}`;
              }
            } else {
              itemRequestQuantity.textContent = `Count: ${info.quantity}`;
            }
          });
        } else {
          itemRequestQuantity.textContent = `Count: ${info.quantity}`;
        }

        itemCard.append(itemImgDiv, itemName, itemLoca, itemRequestQuantity);
        modalBox.append(itemCard);
      }

      const requestTimestamps = document.createElement("p");
      requestTimestamps.textContent = `Requested time: ${new Date(item.time_start).toLocaleString("en-US", options)} - ${new Date(item.time_end).toLocaleString("en-US", options)}`;
      modalBox.append(requestTimestamps);
      const requesterInfoPara = document.createElement("p");
      requesterInfoPara.textContent = `Requested by ${item.name} (${item.email}) on ${item.created_at.split("T")[0]}`;
      modalBox.append(requesterInfoPara);
      const requestNotesPara = document.createElement("p");
      requestNotesPara.textContent = `Notes: ${item.notes != null ? item.notes : "none"}`;
      modalBox.append(requestNotesPara);
      const requestStatusSelector = document.createElement("select");
      const statusOptions = [
        "needs approval",
        "approved",
        "denied",
        "archived",
      ];
      for (let i = 0; i < statusOptions.length; i++) {
        const option = document.createElement("option");
        option.textContent = statusOptions[i];
        requestStatusSelector.appendChild(option);
      }
      requestStatusSelector.value = item.status;
      modalBox.append(requestStatusSelector);
      requestStatusSelector.addEventListener("change", async (e) => {
        if (requestStatusSelector.value == item.status) {
          saveBtn.disabled = true;
        } else {
          saveBtn.disabled = false;
        }
      });

      const btnDiv = document.createElement("div");
      const deleteBtn = document.createElement("button");
      deleteBtn.setAttribute("type", "button");
      deleteBtn.textContent = "delete";
      const cancelBtn = document.createElement("button");
      cancelBtn.setAttribute("type", "button");
      cancelBtn.textContent = "cancel";
      const saveBtn = document.createElement("button");
      saveBtn.setAttribute("type", "button");
      saveBtn.textContent = "save";
      saveBtn.disabled = true;
      btnDiv.append(deleteBtn, cancelBtn, saveBtn);
      modalBox.append(btnDiv);

      deleteBtn.addEventListener("click", async (e) => {
        const isConfirmed = confirm(
          "Are you sure you want to delete this request? This is irreversible",
        );
        if (isConfirmed) {
          requestStatusSelector.disabled = true;
          deleteBtn.disabled = true;
          cancelBtn.disabled = true;
          submitBtn.disabled = true;
          const response = await fetch("/deleterequestitem/" + item.id);
          const jsonResponse = await response.json();
          console.log(JSON.stringify(jsonResponse, null, 2));
          row.remove();
          modalBox.close();
          modalBox.innerHTML = "";
        } else {
          return;
        }
      });
      cancelBtn.addEventListener("click", (e) => {
        modalBox.close();
        modalBox.innerHTML = "";
      });
      saveBtn.addEventListener("click", async (e) => {
        requestStatusSelector.disabled = true;
        deleteBtn.disabled = true;
        cancelBtn.disabled = true;
        saveBtn.disabled = true;
        const requestUpdateObj = {
          status: requestStatusSelector.value,
        };
        const fullRequestObj = {
          requestObj: requestUpdateObj,
          id: Number(row.getAttribute("request-id")),
        };
        const request = await fetch("/submitrequestupdate", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(fullRequestObj),
        }).then((response) => {
          console.log(response);
        });
        modalBox.close();
        requestStatus.textContent = requestStatusSelector.value;
        requestViewNeedsApprovalBtn.classList.remove("selected");
        requestViewNeedsApprovalBtn.click();
        modalBox.innerHTML = "";
      });
    });
  });
}

const requestsBtn = document.querySelector("#requests-btn");
const requestSectionToHide = document.querySelector("#request-section-to-hide");
requestsBtn.addEventListener("click", (e) => {
  if (requestSectionToHide.classList.contains("hidden")) {
    requestSectionToHide.classList.remove("hidden");
    requestsBtn.textContent = "hide section";
  } else {
    requestSectionToHide.classList.add("hidden");
    requestsBtn.textContent = "show section";
  }
});

const requestViewNeedsApprovalBtn = document.querySelector(
  "#view-requests-needs-approval-btn",
);
const requestViewApprovedBtn = document.querySelector(
  "#view-requests-approved-btn",
);
const requestViewDeniedBtn = document.querySelector(
  "#view-requests-denied-btn",
);
const requestViewArchivedBtn = document.querySelector(
  "#view-requests-archived-btn",
);
requestViewNeedsApprovalBtn.classList.add("selected");
requestViewNeedsApprovalBtn.addEventListener("click", async (e) => {
  if (requestViewNeedsApprovalBtn.classList.contains("selected")) {
    return;
  } else {
    requestViewNeedsApprovalBtn.classList.add("loading");
    requestViewApprovedBtn.classList.remove("selected");
    requestViewDeniedBtn.classList.remove("selected");
    requestViewArchivedBtn.classList.remove("selected");
    await populateRequestCards("needs_approval");
    requestViewNeedsApprovalBtn.classList.remove("loading");
    requestViewNeedsApprovalBtn.classList.add("selected");
  }
});
requestViewApprovedBtn.addEventListener("click", async (e) => {
  if (requestViewApprovedBtn.classList.contains("selected")) {
    return;
  } else {
    requestViewNeedsApprovalBtn.classList.remove("selected");
    requestViewApprovedBtn.classList.add("loading");
    requestViewDeniedBtn.classList.remove("selected");
    requestViewArchivedBtn.classList.remove("selected");
    await populateRequestCards("approved");
    requestViewApprovedBtn.classList.remove("loading");
    requestViewApprovedBtn.classList.add("selected");
  }
});
requestViewDeniedBtn.addEventListener("click", async (e) => {
  if (requestViewDeniedBtn.classList.contains("selected")) {
    return;
  } else {
    requestViewNeedsApprovalBtn.classList.remove("selected");
    requestViewApprovedBtn.classList.remove("selected");
    requestViewDeniedBtn.classList.add("loading");
    requestViewArchivedBtn.classList.remove("selected");
    await populateRequestCards("denied");
    requestViewDeniedBtn.classList.remove("loading");
    requestViewDeniedBtn.classList.add("selected");
  }
});
requestViewArchivedBtn.addEventListener("click", async (e) => {
  if (requestViewArchivedBtn.classList.contains("selected")) {
    return;
  } else {
    requestViewNeedsApprovalBtn.classList.remove("selected");
    requestViewApprovedBtn.classList.remove("selected");
    requestViewDeniedBtn.classList.remove("selected");
    requestViewArchivedBtn.classList.add("loading");
    await populateRequestCards("archived");
    requestViewArchivedBtn.classList.remove("loading");
    requestViewArchivedBtn.classList.add("selected");
  }
});

modalBox.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modalBox.innerHTML = "";
  }
});
