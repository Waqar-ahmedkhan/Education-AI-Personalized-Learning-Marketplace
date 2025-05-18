import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EduAIRecommenderSystem")

class CourseRecommender:
    def __init__(self, csv_file):
        self.data = None
        self.tfidf_matrix = None
        self.vectorizer = None
        self.csv_file = csv_file

    def load_data(self):
        try:
            self.data = pd.read_csv(self.csv_file)
            self.data.dropna(subset=["title", "description", "tags"], inplace=True)
            self.data["combined_features"] = self.data["title"] + " " + self.data["description"] + " " + self.data["tags"]
            logger.info(f"Loaded {len(self.data)} courses.")
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise

    def build_model(self):
        try:
            self.vectorizer = TfidfVectorizer(stop_words="english")
            self.tfidf_matrix = self.vectorizer.fit_transform(self.data["combined_features"])
            logger.info("TF-IDF model built successfully.")
        except Exception as e:
            logger.error(f"Error building model: {e}")
            raise

    def recommend(self, query, top_n=5):
        try:
            query_vec = self.vectorizer.transform([query])
            cosine_sim = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            top_indices = cosine_sim.argsort()[::-1][:top_n]
            recommendations = self.data.iloc[top_indices][['title', 'category', 'level', 'description']]
            return recommendations.to_dict(orient='records')
        except Exception as e:
            logger.error(f"Recommendation error: {e}")
            return []
