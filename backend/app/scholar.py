import requests
import time

class SemanticScholarClient:

    def __init__(self, base_url:str="https://api.semanticscholar.org/graph/v1"):
        self.base_url = base_url

    def search_paper(self, query:str, limit:int=1):

        # Temporary delay to throttle API request
        time.sleep(3)

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

            if data.get("data"):
                return data["data"][0]
            else:
                return {"error": "No papers found."}

        except requests.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}

    def get_recommended_paper(self, paper_id:str, limit:int=1):

        # Temporary delay to throttle API request
        time.sleep(3)

        url = f"{self.base_url}/paper/{paper_id}/recommended"
        params = {"limit":limit,
                  "fields":"title,abstract,url,paperId"
                 }
        try:
            response = requests.get(url, params=params)

            if response.status_code == 429:
                return {"error": "Rate limit exceeded. Please wait and try again shortly."}

            if response.status_code == 404:
                return {"error": f"No recommendation found for {paper_id}"}

            response.raise_for_status()
            data = response.json()

            if data.get("data"):
                return data["data"][0]
            else:
                return {"error": "No papers found."}

        except requests.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}
