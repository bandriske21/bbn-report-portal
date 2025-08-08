// src/lib/addressMap.js
import { supabase } from "./supabase";

// We'll keep the address map inside the same "reports" bucket
// at this path. You already allow uploads there.
const META_PATH = "__meta/job-address.json";

// Load the JSON map { "BBN.4342": "Some address", ... }
// If it doesn't exist yet, return an empty object.
export async function loadAddressMap() {
  const { data, error } = await supabase.storage.from("reports").download(META_PATH);
  if (error) return {};
  try {
    const text = await data.text();
    return JSON.parse(text || "{}");
  } catch {
    return {};
  }
}

// Merge + save one job/address pair
export async function saveAddress(jobCode, address) {
  if (!jobCode || !address) return;

  const map = await loadAddressMap();
  if (map[jobCode] === address) return; // nothing to do

  map[jobCode] = address;

  const blob = new Blob([JSON.stringify(map, null, 2)], {
    type: "application/json",
  });

  await supabase.storage
    .from("reports")
    .upload(META_PATH, blob, { upsert: true, contentType: "application/json" });
}

