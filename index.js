import { supabase } from "./db.js";

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

export async function getRequestInfo(requestID) {
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