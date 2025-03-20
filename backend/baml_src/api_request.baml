class Tool {
  type ToolType @description("The type of tool to be used.")
  inputs string[] @description("A list of key-value pairs that define the input for the tool. <arg-name>: <arg-value>")
}

// alternative approach to consider let llm choose tool per tile and then in a next llm call set input per tool. for now trying to do this in one go 

enum ToolType {
    OHLCV @description( #"Retrieve historical OHLCV data for a given company.

    This function searches for a company by name and retrieves its historical 
    price data (OHLCV: Open, High, Low, Close, Volume) via an HTTP POST request to a remote API.

    Args:
        symbol (str): The name or ticker of the company (e.g., "banco santander").
        first (str): The start date for retrieving data, in the format "dd.mm.yyyy".
        last (str): The end date for retrieving data, in the format "dd.mm.yyyy". 
            If provided, data will be fetched up to this date.

    Returns:
        dict: A dictionary containing the JSON response from the API with the historical data."#)

    SEARCHWITHCRITERIA @description( #"Search for companies or stocks based on specified criteria.

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
        dict: A JSON dictionary representing the search results table."#)
}


function GenerateToolCalls(title: string, type: string, description: string, context: string, date: string) -> Tool {
  client "CustomGemini2Flash" 
  prompt #"
    To generate a diagram, decide which of the available tools should be used to retrieve the required data. Also output the input values needed to use the tool.
    The diagram is of type {{ type }} and should show: {{ title }}.
    Here is a description of the content to be displayed in the diagram: 
    {{ description }}

    {% if context %} Consider the following context information:
    {{ context }}{% endif %}
    {% if date %}Todays date is: {{ date }}{% endif %}
    

    {{ ctx.output_format }}
  "# 
}


test test_tool_calls {
  functions [GenerateToolCalls]
  args {
    title "SAP Stock Price (1 Year)"
    type "CANDLE"
    description "Candlestick chart displaying SAP's stock price movement over the past year, showing open, close, high, and low prices for each period."
    context ""
    date "2025-03-20"
  }
}

