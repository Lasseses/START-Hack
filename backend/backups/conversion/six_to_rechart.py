import json


def convert_ohlcv(ohlcv_query, ohlcv_response, diagram_type):
    """ diagram_type can either be "line" or "candlestick" """
    # Extract time series from response
    obj = json.loads(ohlcv_response["object"])
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

    # Get metadata from query
    stock = ohlcv_query["symbol"]
    title = f"Historical OHLCV Data for {stock}"
    description = f"Historical OHLCV data (Open, High, Low, Close, Volume) for {stock} from {ohlcv_query['first']} to {ohlcv_query['last']}."

    # Consolidate
    rechart_payload = {
        "type": diagram_type,
        "stock": stock,
        "title": title,
        "description": description,
        "data": time_series,
    }

    return rechart_payload


def convert_searchwithcriteria(criteria_query, criteria_response):
    # convert six response to rechart format
    obj = json.loads(criteria_response["object"])
    tabular_data = json.loads(obj["data"][0])

    # Get metadata from query
    criteria_query = json.loads(criteria_query)
    title_parts = [f"{key} {value}" for key, value in criteria_query.items()]
    title = "Companies with " + " and ".join(title_parts)
    description = (
        "Retrieve companies that satisfy the following criteria: " +
        "; ".join([f"{key} {value}" for key, value in criteria_query.items()]) + "."
    )

    # Consolidate
    rechart_payload = {
        "type": "tabular",
        "stock": None,
        "title": title,
        "description": description,
        "data": tabular_data,
    }

    return rechart_payload

