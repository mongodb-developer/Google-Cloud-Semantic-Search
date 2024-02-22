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
      $vectorSearch: {
        index: 'vector_index',
        path: 'text_embedding',
        queryVector: embeddedSearchTerms,
        numCandidates: 20,
        limit: 10
      }
    },
    {
      $project: {
        title: 1,
        synopsis: 1,
        authors: 1,
        genres: 1,
        cover: 1,
        score: {
          $meta: "searchScore",
        }
      }
    }
  ]).toArray();

  res.json(records);
});
