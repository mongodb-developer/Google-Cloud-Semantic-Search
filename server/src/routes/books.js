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
        textEmbedding: 0
      }
    }
  ]).toArray();

  res.json(records);
});

routes.route('/search').get(async (req, res) => {
  let limit = req?.query?.limit || 12;
  if (!limit || limit > 100) {
    limit = 12;
  }

  const term = req?.query?.term || '';
  if (!term) {
    res.status(400).send('Missing search term');
    return;
  }

  const embeddedSearchTerms = await createEmbedding(term);
  const records = await collection.aggregate([
    {
      $search: {
        knnBeta: {
          vector: embeddedSearchTerms,
          path: "textEmbedding",
          k: 20,
        }
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        authors: 1,
        genres: 1,
        average_rating: 1,
        ratings_count: 1,
        thumbnail: 1,
        score: {
          $meta: "searchScore",
        }
      }
    }
  ]).toArray();

  res.json(records);
});
