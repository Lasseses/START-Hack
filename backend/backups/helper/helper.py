import re


def previous_quarter(date_str):
    match = re.fullmatch(r"(\d{4})(?:Q([1-4]))?", date_str)
    
    if not match:
        raise ValueError("Invalid date format. Expected 'yyyy' or 'yyyyQq'.")

    year = int(match.group(1))
    quarter = int(match.group(2)) if match.group(2) else None

    if quarter is None:  # If no quarter is present, return the previous year
        return f"{year-1}"
    elif quarter == 1:  # If Q1, move to Q4 of the previous year
        return f"{year-1}Q4"
    else:  # Otherwise, subtract 1 from the quarter
        return f"{year}Q{quarter-1}"
