const functions = require('@google-cloud/functions-framework');
const aiplatform = require('@google-cloud/aiplatform');
const {PredictionServiceClient} = aiplatform.v1;
const {helpers} = aiplatform;

const project = 'atlas-ai-demos';
const location = 'us-central1';
const model = 'multimodalembedding@001';
const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;
const clientOptions = {
  apiEndpoint: `${location}-aiplatform.googleapis.com`,
};

const predictionServiceClient = new PredictionServiceClient(clientOptions);

const getMultiModalEmbeddings = async ({ text, imageURL }) => {
  const instance = {};
  if (text) {
    instance.text = text;
  }
  if (imageURL) {
    const imageBase64 = await getBase64Image(imageURL);
    instance.image = {
      bytesBase64Encoded: imageBase64
    };
  }

  const request = {
    endpoint,
    instances: [helpers.toValue(instance)],
  };

  const response = await predictionServiceClient.predict(request);
  const prediction = helpers.fromValue(response[0].predictions[0]);

  return prediction;
}


const getBase64Image = async (url) => {
  const imageUrlData = await fetch(url);
  const buffer = await imageUrlData.arrayBuffer();
  const stringifiedBuffer = Buffer.from(buffer).toString('base64');
  return stringifiedBuffer;
}

functions.http('getEmbeddings', async (req, res) => {
  const { text, imageURL } = req.body;

  if (!text && !imageURL) {
    return res.status(400).send(new Error('You need to provide "text" and/or "imageURL" in the request body'));
  }

  const embeddings = await getMultiModalEmbeddings({ text, imageURL });
  return res.json(embeddings);
});
