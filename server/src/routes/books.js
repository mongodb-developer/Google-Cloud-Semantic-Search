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

  // TODO: Implement sentiment search by term
  res.send([]);
});

routes.route('/search-by-image').get(async (req, res) => {
  const url = req?.query?.url || '';
  if (!url) {
    res.status(400).send('Missing image URL');
    return;
  }

  // TODO: Implement search by image
  res.send([]);
});
