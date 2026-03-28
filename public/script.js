async function fetchInventoryFromServer() {
    const response = await fetch("/inventory");
    const jsonResponse = await response.json();
    console.log(JSON.stringify(jsonResponse, null, 2));
    return JSON.stringify(jsonResponse, null, 2);
}

async function fetchRequestsFromServer() {
    const response = await fetch("/requests");
    const jsonResponse = await response.json();
    console.log(JSON.stringify(jsonResponse, null, 2));
    return JSON.stringify(jsonResponse, null, 2);
}

async function fetchRequestInfosFromServer(requestID = null) {
    const response = await fetch("/requestinfo/" + requestID);
    const jsonResponse = await response.json();
    console.log(JSON.stringify(jsonResponse, null, 2));
    return JSON.stringify(jsonResponse, null, 2);
}

let currentInventory = await fetchInventoryFromServer();
let currentRequests = await fetchRequestsFromServer();