const passwordInput = document.querySelector("#password");
const passwordPage = document.querySelector("#password-page");
passwordInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const request = await fetch("./submitadminpassword/" + JSON.stringify({ password: passwordInput.value }));
        const response = await request.json();
        if (response) {
            passwordPage.classList.add("successful");
        } else {
            passwordInput.value = "";
            alert("Incorrect password");
        }
    } else {
        return;
    }
})

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

let currentInventory;

const modalBox = document.querySelector("#modal-box");
const inventoryCardsDiv = document.querySelector("#inventory-cards");
async function populateInventoryCards(sort = "name") {
    currentInventory = await fetchInventoryFromServer(sort);
    inventoryCardsDiv.innerHTML = "";

    currentInventory.forEach(item => {
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

    card.append(name, image, location, quantity);
    inventoryCardsDiv.appendChild(card);

    card.addEventListener("click", (e) => {
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
        })
        const locationInput = document.createElement("input");
        locationInput.setAttribute("type", "text");
        locationInput.setAttribute("placeholder", "Location");
        locationInput.value = location.textContent.split(": ")[1];
        const quantityInput = document.createElement("input");
        quantityInput.setAttribute("type", "text");
        quantityInput.setAttribute("placeholder", "Quantity");
        quantityInput.value = quantity.textContent.split(": ")[1];
        modalBox.append(nameInput, imgEx, imgHref, locationInput, quantityInput);

        const btnDiv = document.createElement("div");
        const deleteBtn = document.createElement("button");
        deleteBtn.setAttribute("type", "button");
        deleteBtn.textContent = "delete";
        const cancelBtn = document.createElement("button");
        cancelBtn.setAttribute("type", "button");
        cancelBtn.textContent = "cancel";
        const submitBtn = document.createElement("button");
        submitBtn.setAttribute("type", "button");
        submitBtn.textContent = "submit";
        btnDiv.append(deleteBtn, cancelBtn, submitBtn);
        modalBox.append(btnDiv);

        modalBox.setAttribute("class", "inventory-modal");
        modalBox.showModal();

        deleteBtn.addEventListener("click", async (e) => {
            const isConfirmed = confirm("Are you sure you want to delete this item? This is irreversible");
            if (isConfirmed) {
                const response = await fetch("/deleteinventoryitem/" + card.getAttribute("item-id"));
                const jsonResponse = await response.json();
                console.log(JSON.stringify(jsonResponse, null, 2));
                card.remove();
                modalBox.close();
                modalBox.innerHTML = "";
            } else {
                return;
            }
        })
        cancelBtn.addEventListener("click", (e) => {
            modalBox.close();
            modalBox.innerHTML = "";
        })
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
                    image_link: imgHref.value
                };
            const fullRequestObj = {
                requestObj: newItemObj,
                id: Number(card.getAttribute("item-id"))
            };
            const request = await fetch("/submitinventoryupdate", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(fullRequestObj),
            })
            .then(response => {
                console.log(response);
            });
            modalBox.close();
            name.textContent = nameInput.value;
            location.textContent = `Location: ${locationInput.value}`;
            image.setAttribute("src", imgHref.value);
            quantity.textContent = `Total quantity: ${quantityInput.value}`;
            modalBox.innerHTML = "";
        })
    })
    })
    
    const addNewItem = document.createElement("div");
    const addNewItemPara = document.createElement("p");
    addNewItemPara.textContent = "add new item";
    addNewItem.append(addNewItemPara);
    inventoryCardsDiv.append(addNewItem);
    addNewItem.addEventListener("click", (e) => {
        const nameInput = document.createElement("input");
        nameInput.setAttribute("type", "text");
        nameInput.setAttribute("placeholder", "Item name");
        const imgEx = document.createElement("img");
        const imgHref = document.createElement("input");
        imgHref.setAttribute("type", "text");
        imgHref.setAttribute("placeholder", "Image link");
        imgHref.addEventListener("change", (e) => {
            imgEx.setAttribute("src", imgHref.value);
        })
        const locationInput = document.createElement("input");
        locationInput.setAttribute("type", "text");
        locationInput.setAttribute("placeholder", "Location");
        const quantityInput = document.createElement("input");
        quantityInput.setAttribute("type", "text");
        quantityInput.setAttribute("placeholder", "Quantity");
        modalBox.append(nameInput, imgEx, imgHref, locationInput, quantityInput);

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
        })
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
                    image_link: imgHref.value
                };
            const fullRequestObj = {
                requestObj: newItemObj
            };
            let newItemID;
            const request = await fetch("/submitnewinventoryitem", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(fullRequestObj),
            })
            .then(response => {
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
        })
    })
}
populateInventoryCards();

const inventoryBtn = document.querySelector("#inventory-btn");
const inventorySectionToHide = document.querySelector("#inventory-section-to-hide");
inventoryBtn.addEventListener("click", (e) => {
    if (inventorySectionToHide.classList.contains("hidden")) {
        inventorySectionToHide.classList.remove("hidden");
        inventoryBtn.textContent = "hide section";
    } else {
        inventorySectionToHide.classList.add("hidden");
        inventoryBtn.textContent = "show section";
    }
    
})

const inventorySortNameBtn = document.querySelector("#sort-inventory-name-btn");
const inventorySortLocationBtn = document.querySelector("#sort-inventory-location-btn");
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
})
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
})

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

        row.append(requestCreated, requesterName, requesterEmail, requestTimeStart, requestTimeEnd, requestStatus);
        requestCardsTableBody.appendChild(row);

        row.addEventListener("click", async (e) => {
            let targetRequestInfo = JSON.stringify(await fetchRequestInfosFromServer(item.id));
            const requestInfoPara = document.createElement("p");
            requestInfoPara.textContent = targetRequestInfo;
            modalBox.append(requestInfoPara);

            modalBox.setAttribute("class", "request-modal");
            modalBox.showModal();
        })
    })
}
populateRequestCards();

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
    
})

const requestViewNeedsApprovalBtn = document.querySelector("#view-requests-needs-approval-btn");
const requestViewApprovedBtn = document.querySelector("#view-requests-approved-btn");
const requestViewArchivedBtn = document.querySelector("#view-requests-archived-btn");
requestViewNeedsApprovalBtn.classList.add("selected");
requestViewNeedsApprovalBtn.addEventListener("click", async (e) => {
    if (requestViewNeedsApprovalBtn.classList.contains("selected")) {
        return;
    } else {
        requestViewNeedsApprovalBtn.classList.add("loading");
        requestViewApprovedBtn.classList.remove("selected");
        requestViewArchivedBtn.classList.remove("selected");
        await populateRequestCards("needs_approval");
        requestViewNeedsApprovalBtn.classList.remove("loading");
        requestViewNeedsApprovalBtn.classList.add("selected");
    }
})
requestViewApprovedBtn.addEventListener("click", async (e) => {
    if (requestViewApprovedBtn.classList.contains("selected")) {
        return;
    } else {
        requestViewNeedsApprovalBtn.classList.remove("selected");
        requestViewApprovedBtn.classList.add("loading");
        requestViewArchivedBtn.classList.remove("selected");
        await populateRequestCards("approved");
        requestViewApprovedBtn.classList.remove("loading");
        requestViewApprovedBtn.classList.add("selected");
    }
})
requestViewArchivedBtn.addEventListener("click", async (e) => {
    if (requestViewArchivedBtn.classList.contains("selected")) {
        return;
    } else {
        requestViewNeedsApprovalBtn.classList.remove("selected");
        requestViewApprovedBtn.classList.remove("selected");
        requestViewArchivedBtn.classList.add("loading");
        await populateRequestCards("archived");
        requestViewArchivedBtn.classList.remove("loading");
        requestViewArchivedBtn.classList.add("selected");
    }
})

modalBox.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        modalBox.innerHTML = "";
    }
})