import { Router } from 'express';
import { collection } from '../databaseConnection.js';
import createEmbedding from '../createEmbedding.js';

const routes = Router();
export default routes;

routes.route('/').get(async (req, res) => {
  let limit = req?.query?.limit || 12;
  if (!limit || limit > 100) {
    limit = 12;
  }

  const records = await collection.aggregate([
    {
      $sample: {
        size: Number(limit)
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
  let limit = req?.query?.limit || 12;
  if (typeof limit === 'string') {
    limit = Number(limit);
  }

  if (!limit || limit > 100) {
    limit = 12;
  }

  const term = req?.query?.term || '';
  if (!term) {
    res.status(400).send('Missing search term');
    return;
  }

  // TODO: Implement search
  return [];
});
