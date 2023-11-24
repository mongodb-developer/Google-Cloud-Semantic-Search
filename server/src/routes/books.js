import { Router } from 'express';
import { collection, vectorizedCollection } from '../databaseConnection.js';
import getEmbedding from '../createEmbedding.js';
import createMultiModalEmbedding from '../createMultimodalEmbedding.js';

const routes = Router();
export default routes;

routes.route('/').get(async (req, res) => {
  const records = await collection.aggregate([
    {
      $sample: {
        size: Number(10)
      }
    },
    {
      $project: {
        text_embedding: 0
      }
    }
  ]).toArray();

  res.json(records);
});

routes.route('/search').get(async (req, res) => {
  const term = req?.query?.term || '';
  if (!term) {
    res.status(400).send('Missing search term');
    return;
  }

  const termEmbedding = await getEmbedding(term, process.env.EMBEDDING_ENDPOINT);
  const records = await collection.aggregate([
    {
      $vectorSearch: {
        index: 'textEmbeddings',
        path: 'text_embedding',
        queryVector: termEmbedding,
        numCandidates: 100,
        limit: 10 
      }
    },
    {
      $project: {
        text_embedding: 0
      }
    },
  ]).toArray();

  return res.json(records);
});

routes.route('/search-image-by-text').get(async (req, res) => {
  const term = req?.query?.term || '';
  if (!term) {
    res.status(400).send('Missing search term');
    return;
  }

  const termEmbedding = await createMultiModalEmbedding({text: term});
  console.log(termEmbedding);
  const records = await vectorizedCollection.aggregate([
    {
      $vectorSearch: {
        index: 'default',
        path: 'embedding',
        queryVector: termEmbedding,
        numCandidates: 100,
        limit: 10 
      }
    },
    {
      $project: {
        embedding: 0
      }
    },
  ]).toArray();

  console.log(records);

  return res.json(records);
});

routes.route('/search-by-image').get(async (req, res) => {
  const url = req?.query?.url || '';
  if (!url) {
    res.status(400).send('Missing image URL');
    return;
  }

  const imageEmbedding = await createMultiModalEmbedding({imageURL: url});
  console.log(imageEmbedding);
  const records = await vectorizedCollection.aggregate([
    {
      $vectorSearch: {
        index: 'imageEmbedding',
        path: 'embedding',
        queryVector: imageEmbedding,
        numCandidates: 100,
        limit: 10 
      }
    },
    {
      $project: {
        embedding: 0
      }
    },
  ]).toArray();

  console.log(records);

  return res.json(records);
});
