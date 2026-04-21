const requestIDSpan = document.querySelector("#request-id");
const hrefArray = window.location.href.split("/");
const requestID = hrefArray[hrefArray.length - 1];
requestIDSpan.textContent = requestID;
