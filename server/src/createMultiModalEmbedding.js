export default async function createMultiModalEmbedding({text, imageURL}) {
  const url = process.env.MULTIMODAL_EMBEDDING_ENDPOINT;

  let body = {};
  if (text) {
    body.text = text;
  } else if (imageURL) {
    body.imageURL = imageURL;
  }

  body = JSON.stringify(body);

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
    console.log(response);
    console.error(error);
    throw new Error("Parsing embeddings failed.");
  }

  if (response.error) {
    console.error(response.error);
    throw new Error("Generating embeddings failed.");
  }

  console.dir(response);
  if (text) {
    return response.textEmbedding;
  } else {
    return response.imageEmbedding;
  }
};
