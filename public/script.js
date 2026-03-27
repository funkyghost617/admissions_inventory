async function fetchDataFromServer() {
    const response = await fetch("/data");
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    console.log(JSON.stringify(jsonResponse, null, 2));
    return;
}

fetchDataFromServer();