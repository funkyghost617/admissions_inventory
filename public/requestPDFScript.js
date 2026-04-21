const requestIDSpan = document.querySelector("#request-id");
const hrefArray = window.location.href.split("/");
const requestID = hrefArray[hrefArray.length - 1];
requestIDSpan.textContent = requestID;

async function fetchRequestFromServer(id) {
  const response = await fetch("/request/" + id);
  const jsonResponse = await response.json();
  console.log(JSON.stringify(jsonResponse, null, 2));
  return JSON.parse(JSON.stringify(jsonResponse, null, 2));
}

async function populateWithRequestInfo() {
  const requestArray = await fetchRequestFromServer(requestID);
  const requestObj = requestArray[0];
  console.log(requestObj);
}

populateWithRequestInfo();
