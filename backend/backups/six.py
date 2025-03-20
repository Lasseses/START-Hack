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