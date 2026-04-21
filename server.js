// server.js
import express from "express";
import path from "path";
import fs from "node:fs/promises";
const app = express();
const port = process.env.PORT || 3000;
const __dirname = "./";

// serve static files from github pages project
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// define a basic route for the root
app.get("/", async (req, res) => {
  sendFileAsync("public/index.html", res);
  const { error } = await supabase.auth.signOut();
});

app.get("/admin", async (req, res) => {
  sendFileAsync("public/admin.html", res);
  const { error } = await supabase.auth.signOut();
});

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://csojncjvwtpnskbknqvi.supabase.co",
  "sb_publishable_IXyzkAJjqR0Z6bRy2KnY6g_3jS4BmBU",
);

async function getInventory(sort = "name") {
  const { data, error } = await supabase
    .from("Inventory")
    .select("*")
    .order(sort, { ascending: true });

  if (error) {
    console.error("Error fetching items:", error);
  } else {
    console.log("Items:", data);
    return data;
  }
}

async function getRequests(status) {
  if (status == "all") {
    const { dataALL, errorALL } = await supabase
      .from("Requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching requests:", error);
      return error;
    } else {
      console.log("Requests:", data);
      return data;
    }
  }

  const { data, error } = await supabase
    .from("Requests")
    .select("*")
    .eq("status", status.replace("_", " "))
    .order("created_at", {
      ascending: status == "needs_approval" ? false : true,
    });

  if (error) {
    console.error("Error fetching requests:", error);
    return error;
  } else {
    console.log("Requests:", data);
    return data;
  }
}

async function getRequestInfo(requestID) {
  if (requestID == null) {
    const { data, error } = await supabase.from("Requests (info)").select("*");
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
      .eq("request_id", requestID)
      .order("item_id", { ascending: true });
    if (error) {
      console.error("Error fetching request info:", error);
    } else {
      console.log("Request info:", data);
      return data;
    }
  }
}

app.get("/inventory/:id", async (req, res) => {
  res.send(await getInventory(req.params.id));
});

app.get("/requests/:id", async (req, res) => {
  res.send(await getRequests(req.params.id));
});

app.get("/requestinfo/:id", async (req, res) => {
  res.send(await getRequestInfo(req.params.id));
});

async function getInventoryItem(itemID) {
  const { data, error } = await supabase
    .from("Inventory")
    .select("*")
    .eq("id", Number(itemID));

  if (error) {
    console.error("Error fetching item:", error);
  } else {
    console.log("Item:", data);
    return data;
  }
}

app.get("/getinventoryitem/:id", async (req, res) => {
  res.send(await getInventoryItem(req.params.id));
});

async function submitRequest(jsonRequest) {
  let fullRequest = JSON.parse(jsonRequest);
  const { data, error } = await supabase
    .from("Requests")
    .insert(fullRequest.request)
    .select();
  const requestObj = data[0];
  const requestInfoArray = fullRequest.request_info;
  requestInfoArray.forEach(async (infoItem) => {
    const infoObj = {
      quantity: infoItem.quantity,
      item_id: infoItem.item_id,
      request_id: requestObj.id,
    };
    const { error } = await supabase.from("Requests (info)").insert(infoObj);
  });
}

app.get("/submitrequest/:id", async (req, res) => {
  await submitRequest(req.params.id);
  res.send(JSON.stringify("success!"));
});

app.post("/submitadminlogin", async (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  console.log(submittedEmail, submittedPassword);
  const { data, error } = await supabase.auth.signInWithPassword(req.body);
  console.log(data, error);
  res.send(data.user != null ? data.user : error);
});

async function submitInventoryUpdate(jsonRequest) {
  let fullRequest = jsonRequest;
  console.log(fullRequest);
  let requestObject = fullRequest.requestObj;
  console.log(requestObject);
  const { data, error } = await supabase
    .from("Inventory")
    .update(requestObject)
    .eq("id", fullRequest.id)
    .select();
  console.log(data);
}

app.post("/submitinventoryupdate", async (req, res) => {
  await submitInventoryUpdate(req.body);
  res.send(JSON.stringify("success!"));
});

async function submitNewInventoryItem(jsonRequest) {
  let fullRequest = jsonRequest;
  console.log(fullRequest);
  let requestObject = fullRequest.requestObj;
  console.log(requestObject);
  const { data, error } = await supabase
    .from("Inventory")
    .insert(requestObject)
    .select();
  console.log(data);
  return data.id;
}

app.post("/submitnewinventoryitem", async (req, res) => {
  const newItemID = await submitNewInventoryItem(req.body);
  res.send(JSON.stringify({ message: "success!", id: newItemID }));
});

async function deleteInventoryItem(requestedID) {
  const response = await supabase
    .from("Inventory")
    .delete()
    .eq("id", Number(requestedID));
  console.log("success!");
}

app.get("/deleteinventoryitem/:id", async (req, res) => {
  await deleteInventoryItem(req.params.id);
  res.send(JSON.stringify("success!"));
});

async function deleteRequestItem(requestedID) {
  const response = await supabase
    .from("Requests")
    .delete()
    .eq("id", Number(requestedID));
  console.log("success!");
}

app.get("/deleterequestitem/:id", async (req, res) => {
  await deleteRequestItem(req.params.id);
  res.send(JSON.stringify("success!"));
});

async function updateRequestItem(jsonRequest) {
  let fullRequest = jsonRequest;
  console.log(fullRequest);
  let requestObject = fullRequest.requestObj;
  console.log(requestObject);
  const { data, error } = await supabase
    .from("Requests")
    .update(requestObject)
    .eq("id", fullRequest.id)
    .select();
  console.log(data);
}

app.post("/submitrequestupdate", async (req, res) => {
  await updateRequestItem(req.body);
  res.send(JSON.stringify("success!"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.use((req, res, next) => {
  res.status(404).sendFile("public/404.html", { root: __dirname });
});

async function sendFileAsync(filePath, res) {
  try {
    const data = await fs.readFile(filePath);
    res.sendFile(filePath, { root: __dirname });
  } catch (error) {
    res.sendFile("public/pages/404.html", { root: __dirname });
  }
}
