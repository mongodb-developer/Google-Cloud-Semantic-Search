# MongoDB Atlas and Google Cloud Vector Search

This is a demo of vector search using MongoDB Atlas and Google Cloud. The dataset is a catalogue of books. The project uses Node.js and express for the server and Angular for the client.

## Prerequisites

1. [Node.js](https://nodejs.org/) LTS.

1. [`mongoimport`](https://www.mongodb.com/docs/database-tools/installation/installation/?utm_campaign=devrel&utm_source=cross-post&utm_medium=cta&utm_content=gc-vector-search-demo&utm_term=stanimira.vlaeva) for importing the dataset.

## Setup

Follow the instructions below to run the demo locally.

### Import the dataset into MongoDB Atlas

1. Clone the project.

    ```sh
    git clone https://github.com/mongodb-developer/Google-Cloud-Semantic-Search
    ```

1. Navigate to the `prepare-data` directory and install the dependencies.

    ```sh
    npm install
    ```

1. Create a free [MongoDB Atlas account](https://www.mongodb.com/try?utm_campaign=devrel&utm_source=cross-post&utm_medium=cta&utm_content=gc-vector-search-demo&utm_term=stanimira.vlaeva).

1. Deploy a free [M0 database cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/?utm_campaign=devrel&utm_source=cross-post&utm_medium=cta&utm_content=gc-vector-search-demo&utm_term=stanimira.vlaeva) in a region of your choice.

1. Complete the [security quickstart](https://www.mongodb.com/docs/atlas/security/quick-start/?utm_campaign=devrel&utm_source=cross-post&utm_medium=cta&utm_content=gc-vector-search-demo&utm_term=stanimira.vlaeva).

1. Add your [connection string](https://www.mongodb.com/docs/atlas/tutorial/connect-to-your-cluster/?utm_campaign=devrel&utm_source=cross-post&utm_medium=cta&utm_content=gc-vector-search-demo&utm_term=stanimira.vlaeva) to `prepare-data/.env`. Make sure to replace the placeholders with credentials of the database user you created in the security quickstart.

    **prepare-data/.env**
    ```
    ATLAS_URI="<your-connection-string>"
    ```

1. Execute `mongoimport` to load the `books.csv` dataset into your database. Replace the placeholder with your own connection string.

    ```sh
    mongoimport \
        --uri="<your-connection-string>" \
        --db=library \
        --collection=books \
        --type=csv --headerline \
        --file="./books.csv"
    ```

1. Navigate to your MongoDB Atlas database deployment and verify that the dataset is loaded successfully.

### Generate embeddings

1. Create a new Google Cloud project with billing enabled.

1. Enable the Vertex AI and Cloud Functions APIs.

1. Deploy a public 2nd generation Google Cloud Function with the following implementation:
    - [Generate embeddings](./google-cloud-functions/generate-embeddings/)

    Replace the `PROJECT_ID` and `LOCATION` placeholders before deploying the function. If you have the [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) installed, run the following deployment command.

    ```sh
    gcloud functions deploy generate-embeddings \
      --region=us-central1 \
      --gen2 \
      --runtime=python311 \
      --source=./google-cloud-functions/generate-embeddings/ \
      --entry-point=generate_embeddings \
      --trigger-http \
      --allow-unauthenticated
    ```

1. Add the deployed function URL to `prepare-data/.env`.

    **prepare-data/.env**
    ```
    ATLAS_URI="<your-connection-string>"
    EMBEDDING_ENDPOINT="<your-cloud-function-url>"
    ```

1. Run the embeddings generation script.

    ```sh
    node ./create-embeddings.js
    ```

    > Note that Vertex AI has a limitation for generating 600 embeddings per minute. If you're getting 403 errors, wait for a minute and rerun the script. Repeat until all documents are 'vectorized'.

1. Go back to your MongoDB Atlas project and open the deployed database cluster. Verify that the `library.books` collection has a new `text_embedding` field containing a multi-dimensional vector.

1. Navigate to the `search` tab to build a vector search index.

1. Click 'Create new index' and select 'JSON'.

1. Insert the following index definition and click 'Save'.

    ```json
    {
        "mappings": {
            "fields": {
                "textEmbedding": {
                    "type": "knnVector",
                    "dimensions": 768,
                    "similarity": "euclidean"
                }
            }
        }
    }
    ```

### Running the project

1. Navigate to the `server` directory.

1. Copy the `prepare-data/.env`.

    ```
    cp ../prepare-data/.env .
    ```

1. Install the dependencies and run the application.

    ```
    npm install && npm start
    ```

1. Open a new terminal window to run the client application.

1. In the new window, navigate to the `client` directory.

1. Install the dependices and run the project.

    ```
    npm install && npm start
    ```

1. Open the browser at `localhost:4200` and find books using the power of vector search!

