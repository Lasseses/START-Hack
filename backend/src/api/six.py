"""
query: Query the graph.
searchwithcriteria: Search companies that fulfill several criteria.
ohlcv: Get historical price data.
companydatasearch: Get information about one or more companies.
summary: Get basic information about a company.
llm: Query OpenAI 4o model.
"""
import requests


def query_llm(query:str):
    " Query gpt-4o-mini for a normal query. "
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           f"switzerlandnorth.azurecontainerapps.io//llm?query={query}")

    response = requests.post(url)
    return response.json()


def query_agent(query:str):
    " Query an agent that can use all of the tools below "
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           f"switzerlandnorth.azurecontainerapps.io//query?query={query}")

    response = requests.post(url)
    return response.json()

def searchwithcriteria(query):
    """
    Search with criteria. Query is a string with a dict schema like: '{"criteria": "logical value"}'.
    For example: '{"ebitda": "is positive", "employees": "more than 10000"}'.
    """
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//searchwithcriteria"
           f"?query={query}")
    response = requests.post(url)
    return response.json()

def ohlcv(query, first="01.01.2024", last=None):
    """
    Price Data. Search a company by name and get its historical price data. Query is a string like: "banco santander", 
    first is the first date to retrieve data and last(optional) is the last date to retrieve data. Dates are strings in the format "dd.mm.yyyy".
    """
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//ohlcv"
           f"?query={query}&first={first}")
    if last:
        url = f"{url}&last={last}"
    response = requests.post(url)
    return response.json()

def companydatasearch(query:str):
    """
    This tool is useful when you need information about one or more companies, such as employee numbers, 
    market or financial information, ratios, fundamentals, etc. Input the query in the following format: 
    '{"company1": "information to retrieve|yyyyQq"; "company2": "information to retrieve|yyyy"}'.
    Example: '{"Caixabank": "number of employees|2023"; "BBVA": "number of employees|2023"}'.
    """
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//companydatasearch"
           f"?query={query}")
    response = requests.post(url)
    return response.json()

def summary(query:str):
    " This tools retrieves basic information about a company. Query is the name of the company to search. "
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//summary"
           f"?query={query}")
    response = requests.post(url)
    return response.json()


output_mapping = {
    # function_name: query tool name
    companydatasearch: "Company_Data_Search",
    ohlcv: "Historical_Price_Data",
    
}