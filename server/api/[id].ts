export default defineEventHandler(async (event) => {
  if (!event.context.params) {
    return ""; // Επιστροφή κενού string αν τα params λείπουν
  }
  const placeId = event.context.params.id;
  const apiKey = process.env.GOOGLE_API_KEY || "";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}&libraries=places&v=weekly&sensor=false&language=el`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Google Place Details:", error);
    throw error;
  }
});
