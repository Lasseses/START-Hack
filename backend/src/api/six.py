"""
Example Usage:

from api.six import call_ohlcv
from api.six import call_searchwithcriteria

call_ohlcv('NVIDIA', '01.01.2020', '01.01.2021')
call_searchwithcriteria('{"ebitda": "is positive", "employees": "more than 10000"}')
"""

import requests
import json


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
    # Get data from six api
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//ohlcv"
           f"?query={symbol}&first={first}&last={last}")
    response = requests.post(url).json()

    # Unpack data
    obj = json.loads(response["object"])
    data = json.loads(obj["data"])
    time_series_raw = json.loads(list(data.values())[0])

    # Convert time series to rechart format
    time_series = []
    for timestamp, values in time_series_raw.items():
        date_only = timestamp.split("T")[0]
        
        time_series.append({
            'name': date_only,
            'open': values['open'],
            'high': values['high'],
            'low': values['low'],
            'close': values['close'],
            'volume': values['vol']
        })

    return time_series


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
    if isinstance(query, dict):
        query = json.dumps(query)

    # Get data from six api
    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//searchwithcriteria"
           f"?query={query}")
    response = requests.post(url).json()

    # convert six response to rechart format
    obj = json.loads(response["object"])
    tabular_data = json.loads(obj["data"][0])

    return tabular_data


def fetch_asset_allocation(customer_name):
    """
    Fetches the asset allocation for a given customer.

    This function takes a dictionary representing a customer's portfolio and returns a dictionary
    with two keys: 'labels' (asset names) and 'data' (allocation percentages). This structure
    is directly consumable by a frontend to render a pie chart.

    Args:
        customer (dict): A dictionary containing the customer's information, including a "portfolio" key.

    Returns:
        dict: A dictionary with keys 'labels' and 'data'.
    """
    with open("res/asset_allocation.json", "r") as file:
        data = json.load(file)
    
    customer_data = [customer_data for customer_data in data if customer_data["name"] == customer_name][0]

    portfolio = customer.get("portfolio", [])
    labels = [item.get("asset") for item in portfolio]
    data = [item.get("allocation") for item in portfolio]
    
    # Optionally, validate if the allocations sum to 100%
    total_allocation = sum(data)
    if total_allocation != 100:
        print(f"Warning: Total allocation for customer {customer.get('customer_id')} is {total_allocation}, expected 100.")

    return {"labels": labels, "data": data}


