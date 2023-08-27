export default async function createEmbedding(query) {
  // Replace with the URL of your Google Cloud Function
  const url = `https://us-central1-atlas-ai-demos.cloudfunctions.net/generate-text-embeddings`;
  const body = JSON.stringify({
    text: query
  });

  let response = await fetch(url, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  try {
    response = await response.json();
  } catch (error) {
    console.error(error);
    throw new Error("Parsing embeddings failed.");
  }

  if (response.error) {
    console.error(response.error);
    throw new Error("Generating embeddings failed.");
  }

  return response?.vectors[0] || [];
};

