// server.js
import express from "express";
import path from "path";
import fs from "node:fs/promises";
const app = express();
const port = process.env.PORT || 3000;
const __dirname = "./";

// serve static files from github pages project
app.use(express.static(path.join(__dirname, "public")));

// define a basic route for the root
app.get("/", (req, res) => {
    sendFileAsync("public/index.html", res);
});

import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://csojncjvwtpnskbknqvi.supabase.co", "sb_publishable_IXyzkAJjqR0Z6bRy2KnY6g_3jS4BmBU");

export async function getInventory() {
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

export async function getRequests() {
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

export async function getRequestInfo() {
    const { data, error } = await supabase
        .from("Requests (info)")
        .select("*");
    
    if (error) {
        console.error("Error fetching request info:", error);
    } else {
        console.log("Request info:", data);
        return data;
    }
}

app.get("/data", async (req, res) => {
    res.json({ data: [await getInventory(), await getRequests(), await getRequestInfo(), "hello world"] });
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