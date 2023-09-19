export default async function createEmbedding(query) {
  const url = process.env.EMBEDDING_ENDPOINT;
  const body = JSON.stringify({
    text: [query]
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

