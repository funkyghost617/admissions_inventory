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

const modalBox = document.querySelector("#modal-box");
const inventoryCardsDiv = document.querySelector("#inventory-cards");
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
        const cancelBtn = document.createElement("button");
        cancelBtn.setAttribute("type", "button");
        cancelBtn.textContent = "cancel";
        const submitBtn = document.createElement("button");
        submitBtn.setAttribute("type", "button");
        submitBtn.textContent = "submit";
        btnDiv.append(cancelBtn, submitBtn);
        modalBox.append(btnDiv);

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
                    //image_link: imgHref.value
                };
            const fullRequestObj = {
                requestObj: newItemObj,
                id: Number(card.getAttribute("item-id"))
            };
            const request = await fetch("/submitinventoryupdate/" + JSON.stringify(fullRequestObj));
            const response = await request.json();
            console.log(response);
            modalBox.close();
            name.textContent = nameInput.value;
            location.textContent = `Location: ${locationInput.value}`;
            image.setAttribute("src", imgHref.value);
            quantity.textContent = `Total quantity: ${quantityInput.value}`;
            modalBox.innerHTML = "";
        })
    })
})