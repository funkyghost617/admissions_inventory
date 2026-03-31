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