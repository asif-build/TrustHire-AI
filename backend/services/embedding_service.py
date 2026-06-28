def generate_embeddings(text):
    """
    Generates semantic vector embeddings for search matching.
    TODO: Add Google Gemini text-embedding-004 API integration.
    """
    # Returns a mock vector embedding (e.g. array of size 128)
    import numpy as np
    mock_vector = np.random.uniform(-0.1, 0.1, 128).tolist()
    return mock_vector
