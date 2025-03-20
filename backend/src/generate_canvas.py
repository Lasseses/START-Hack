# generate_canvas.py
import sys
import os
import dotenv
from datetime import datetime
import logging
import json

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(backend_path)

import baml_client as client

# from baml_client.async_client import b as b_async # TODO use async_client
from baml_client import reset_baml_env_vars
from baml_client.types import Tile, ToolType

from api.six import call_ohlcv, call_searchwithcriteria, fetch_asset_allocation

TOOLS = {
    ToolType.OHLCV: call_ohlcv,
    ToolType.SEARCHWITHCRITERIA: call_searchwithcriteria,
    ToolType.FETCH_ASSET_ALLOCATION: fetch_asset_allocation,
}


# Set up logging
log_file_path = os.path.join(backend_path, "generate_canvas.log")
logging.basicConfig(
    filename=log_file_path,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

logging.debug("Logging setup complete.")

dotenv.load_dotenv()

reset_baml_env_vars(dict(os.environ))


class DataTile(Tile):
    data: list
    position: int


def generate_canvas(user_input: str, canvas_context: str = "") -> list[DataTile]:
    logging.info(
        "Generating canvas with user input: %s and context: %s",
        user_input,
        canvas_context,
    )
    canvas = client.b.GenerateCanvas(user_input, canvas_context)
    logging.info("Generated canvas: %s", canvas)
    canvas_data = []
    for tile in canvas.tiles:
        use_date = tile.type in ["LINE", "CANDLE"]
        logging.debug("Generating tool call for tile: %s", tile)
        tool_call = generate_tool_call(tile=tile, context="", date=use_date)
        logging.info("Generated tool call: %s", tool_call)
        data = perform_tool_call(tool_call)
        data_tile = DataTile(
            title=tile.title,
            type=tile.type,
            content=tile.content,
            data=data,
            position=len(canvas_data),
            # could resolve positioning differently later or update
        )
        canvas_data.append(data_tile)

    save_canvas(canvas_data)

    return canvas_data


def generate_tool_call(tile: Tile, context: str = "", date: bool = False) -> str:
    if date:
        current_date = datetime.now().strftime("%Y-%m-%d")
    else:
        current_date = ""

    tool_call = client.b.GenerateToolCalls(
        title=tile.title,
        type=tile.type.value,
        description=tile.content,
        context=context,
        date=current_date,
    )
    return tool_call


def perform_tool_call(tool_call) -> str:
    # TODO: Add api calls here
    function = TOOLS[tool_call.type]
    inputs_dict = dict(item.split("=") for item in tool_call.inputs)
    response = function(**inputs_dict)
    return response


def save_canvas(canvas_data):
    canvas_folder = os.path.join(backend_path, "src/canvas")
    os.makedirs(canvas_folder, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(canvas_folder, f"canvas_{timestamp}.json")

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(
            [data_tile.__dict__ for data_tile in canvas_data],
            file,
            ensure_ascii=False,
            indent=4,
        )

    logging.info("Canvas data written to file: %s", file_path)


def main():
    logging.info("### Starting a new run of canvas generation. ###")
    user_input = input("Enter user input: ")
    context = input("Enter context (optional): ")
    canvas = generate_canvas(user_input, context)


if __name__ == "__main__":
    main()
