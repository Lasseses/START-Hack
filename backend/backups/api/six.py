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
    query_as_dict = json.loads(query)
    symbol, info_period = query_as_dict.popitem()
    info, period = info_period.split("|")
    previous_period = previous_quarter(period)
    query2_as_dict = {symbol: f"{info}|{previous_period}"}

    extended_query = \
        "{" + f'"{symbol}": "{info}|{period}" + ";" +\
        "{symbol}": "{info}|{previous_period}"' + "}"

    print(extended_query)

    url = ("https://idchat-api-containerapp01-dev.orangepebble-16234c4b."
           "switzerlandnorth.azurecontainerapps.io//companydatasearch"
           f"?query={extended_query}")
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
