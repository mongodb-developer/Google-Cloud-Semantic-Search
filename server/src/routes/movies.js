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
                plot_embedding_vertex_ai: 0
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
                // index: 'semantic',
                index: 'plot_semantic_search',
                knnBeta: {
                    // vector: embeddedSearchTerms,
                    // path: "textEmbedding",
                  vector: embeddedSearchTerms,
                  path: "plot_embedding_vertex_ai",

                    k: 100,
                }
            }
        }
    ]).toArray();

    res.json(records);
});
