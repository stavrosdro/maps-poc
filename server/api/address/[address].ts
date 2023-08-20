// server/api/address/[address].ts
import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  if (!event.context.params) {
    return ""; // Επιστροφή κενού string αν τα params λείπουν
  }
  const input = event.context.params.address;
  const apiKey = process.env.GOOGLE_API_KEY || "";
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}&sensor=false&language=el`;
  // https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap <---- new
  // https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey} <---- old

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching Google Places:", error);
    throw error;
  }
});

// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
