import requests
import time, datetime

class SemanticScholarClient:

    def __init__(self, base_url:str="https://api.semanticscholar.org/graph/v1"):
        self.base_url = base_url
        self.fallback_cache = []
        self.fallback_index = 0
        self.default_query = "Asymptomatic infection of COVID-19"

    def search_paper(self, query:str, limit:int=1):

        # Temporary delay to throttle API request
        time.sleep(3)
        print("Calling Semantic Scholar at", datetime.datetime.now().isoformat())

        if not query:
            query = self.default_query

        url = f"{self.base_url}/paper/search"
        params = {"query":query,
                  "limit":limit,
                  "fields":"title,abstract,url,paperId"
                 }
        try:
            response = requests.get(url, params=params)

            if response.status_code == 429:
                return {"error": "Rate limit exceeded. Please wait and try again shortly."}

            response.raise_for_status()
            data = response.json()

            return data["data"] if limit > 1 else (data["data"][0] if data.get("data") else {"error": "No papers found."})

        except requests.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}


    def get_recommended_paper_from_list(self, positive_ids, negative_ids, limit=1):

        # Temporary delay to throttle API request
        time.sleep(3)
        print("Calling Semantic Scholar at", datetime.datetime.now().isoformat())

        url = "https://api.semanticscholar.org/recommendations/v1/papers/forpapers"
        payload = {
            "positivePaperIds": positive_ids,
            "negativePaperIds": negative_ids,
            "fields": ["title", "abstract", "url", "paperId"],
            "limit": limit
        }

        try:
            response = requests.post(url, json=payload)

            if response.status_code == 429:
                return {"error": "Rate limit exceeded."}

            response.raise_for_status()
            data = response.json()

            if data.get("recommendedPapers"):
                return data["recommendedPapers"][0]
            else:
                return {"error": "No recommended papers returned."}

        except requests.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}


    def get_fallback_paper(self):

        if not self.fallback_cache:
            print("Fetching new fallback cache...")
            self.fallback_cache = self.search_paper(query=self.default_query, limit=20)
            self.fallback_index = 0

        if self.fallback_index >= len(self.fallback_cache):
            print("Fallback cache exhausted. Refetching...")
            self.fallback_cache = self.search_paper(query=self.default_query, limit=20)
            self.fallback_index = 0

        paper = self.fallback_cache[self.fallback_index]
        self.fallback_index += 1
        return paper