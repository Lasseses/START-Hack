import requests
from helper.helper import previous_quarter


def call_ohlcv(symbol, first, last):
    """
    Retrieve historical OHLCV data for a given company.

    This function searches for a company by name and retrieves its historical 
    price data (OHLCV: Open, High, Low, Close, Volume) via an HTTP POST request to a remote API.

    Args:
        symbol (str): The name or ticker of the company (e.g., "banco santander").
        first (str): The start date for retrieving data, in the format "dd.mm.yyyy".
        last (str): The end date for retrieving data, in the format "dd.mm.yyyy". 
            If provided, data will be fetched up to this date.

    Returns:
        dict: A dictionary containing the JSON response from the API with the historical data.

    """
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//ohlcv"
           f"?query={symbol}&first={first}")
    if last:
        url = f"{url}&last={last}"
    response = requests.post(url)
    return response.json()


def call_searchwithcriteria(query):
    """
    Search for companies or stocks based on specified criteria.

    This function accepts a query string containing search criteria in JSON format.
    The JSON should follow a dictionary schema where keys are attributes and values
    define the logical condition for filtering. For example:
    
        '{"ebitda": "is positive", "employees": "more than 10000"}'
    
    The function sends an HTTP POST request to a remote API endpoint and retrieves a table
    of search results in JSON format. The returned table includes the following columns:
    
        - Name
        - SIX_ID
        - ISIN
        - Valornumber (listing)
        - Bourse Code
        - Currency
        - Fundamentals annual 1 - EBITDA (millions)
        - Fundamentals annual 1 - Employees (millions)
    
    Args:
        query (str): A JSON-formatted string specifying the search criteria. Possible search criteria are: 
        [
            'revenue',
            'net_income',
            'EBITDA',
            'operating_income',
            'EPS',
            'dividend_yield',
            'PE_ratio',
            'market_cap',
            'employees',
            'debt_to_equity',
            'return_on_equity',
            'operating_margin',
            'profit_margin',
            'free_cash_flow',
            'total_assets',
            'total_liabilities',
            'current_ratio',
            'quick_ratio',
            'sector',
            'industry',
            'country',
            'founded_year',
            'exchange',
            'short_interest',
            'dividend_payout_ratio',
            'insider_ownership',
            'institutional_ownership',
            'gross_margin',
            'EPS_growth',
            'price_target'
        ]
    
    Returns:
        dict: A JSON dictionary representing the search results table.
    
    """
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//searchwithcriteria"
           f"?query={query}")
    response = requests.post(url)
    return response.json()


def call_companydatasearch(query:str):
    """
    Retrieve a specific piece of information for a given company along 
    with the corresponding value from the previous period to analyze trends.
    
    The query should be provided as a JSON-formatted string with the following structure:
      '{"<symbol>": "<information>|<period>"}'
      
    Where:
      - `<symbol>` is the company's ticker or name (e.g., "Caixabank").
      - `<information>` is the specific data point to retrieve (e.g., "number of employees", "market capitalization", "EPS", etc.).
      - `<period>` is either a four-digit year (e.g., "2023") or a quarter in the format "yyyyQq" (e.g., "2023Q1").
    
    Example:
      '{"Caixabank": "number of employees|2023"}'
    
    The function returns the requested value along with the value for the previous period 
    (e.g., last year or the preceding quarter) so that trends can be observed.
    """

    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//companydatasearch"
           f"?query={query}")
    response = requests.post(url)
    return response.json()



# ========== TO BE REFINED ============

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


def summary(query:str):
    " This tools retrieves basic information about a company. Query is the name of the company to search. "
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//summary"
           f"?query={query}")
    response = requests.post(url)
    return response.json()
