import functions_framework
import json
import vertexai
from vertexai.language_models import TextEmbeddingModel

@functions_framework.http
def generate_embeddings(request):
    request_json = request.get_json(silent=True)

    if request_json and "text" in request_json:
        text = request_json["text"]
    else:
        error = { "error": "'text' is required." }
        return json.dumps(error), 400, {"Content-Type": "application/json"}

    vertexai.init(project="atlas-ai-demos", location="us-central1")

    model = TextEmbeddingModel.from_pretrained("textembedding-gecko@001")
    embeddings = model.get_embeddings(text)
    vectors = []
    for embedding in embeddings:
        vector = embedding.values
        vectors.append(vector)

    data = { "vectors": vectors }

    return json.dumps(data), 200, {"Content-Type": "application/json"}
