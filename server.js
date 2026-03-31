// server.js
import express from "express";
import path from "path";
import fs from "node:fs/promises";
const app = express();
const port = process.env.PORT || 3000;
const __dirname = "./";
const adminPassword = "Huh67";

// serve static files from github pages project
app.use(express.static(path.join(__dirname, "public")));

// define a basic route for the root
app.get("/", (req, res) => {
    sendFileAsync("public/index.html", res);
});

app.get("/admin", (req, res) => {
    sendFileAsync("public/admin.html", res);
});

import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://csojncjvwtpnskbknqvi.supabase.co", "sb_publishable_IXyzkAJjqR0Z6bRy2KnY6g_3jS4BmBU");

async function getInventory() {
    const { data, error } = await supabase
        .from("Inventory")
        .select("*");

    if (error) {
        console.error("Error fetching items:", error);
    } else {
        console.log("Items:", data);
        return data;
    }
}

async function getRequests() {
    const { data, error } = await supabase
        .from("Requests")
        .select("*");

    if (error) {
        console.error("Error fetching requests:", error);
    } else {
        console.log("Requests:", data);
        return data;
    }
}

async function getRequestInfo(requestID) {
    if (requestID == null) {
        const { data, error } = await supabase
            .from("Requests (info)")
            .select("*");
        if (error) {
            console.error("Error fetching request info:", error);
        } else {
            console.log("Request info:", data);
            return data;
        }
    } else {
        const { data, error } = await supabase
            .from("Requests (info)")
            .select("*")
            .eq("request_id", requestID);
        if (error) {
            console.error("Error fetching request info:", error);
        } else {
            console.log("Request info:", data);
            return data;
        }
    }
}

app.get("/inventory", async (req, res) => {
    res.send(await getInventory());
})

app.get("/requests", async (req, res) => {
    res.send(await getRequests());
})

app.get("/requestinfo/:id", async (req, res) => {
    res.send(await getRequestInfo(req.params.id));
})

async function submitRequest(jsonRequest) {
    let fullRequest = JSON.parse(jsonRequest)
    const { data, error } = await supabase
        .from("Requests")
        .insert(fullRequest.request)
        .select();
    const requestObj = data[0];
    const requestInfoArray = fullRequest.request_info;
    requestInfoArray.forEach(async (infoItem) => {
        const infoObj = { quantity: infoItem.quantity, item_id: infoItem.item_id, request_id: requestObj.id };
        const { error } = await supabase
            .from("Requests (info)")
            .insert(infoObj);
    })
}

app.get("/submitrequest/:id", async (req, res) => {
    await submitRequest(req.params.id);
    res.send(JSON.stringify("success!"));
})

app.get("/submitadminpassword/:id", (req, res) => {
    const submittedPassword = JSON.parse(req.params.id).password;
    console.log(submittedPassword);
    if (submittedPassword == adminPassword) {
        res.send(JSON.stringify(true));
        return;
    } else {
        res.send(JSON.stringify(false));
        return;
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use((req, res, next) => {
    res.status(404).sendFile("public/404.html", { root: __dirname });
})

async function sendFileAsync(filePath, res) {
    try {
        const data = await fs.readFile(filePath);
        res.sendFile(filePath, { root: __dirname });
    } catch (error) {
        res.sendFile("public/pages/404.html", { root: __dirname });
    }
}