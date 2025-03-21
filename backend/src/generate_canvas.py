# generate_canvas.py
import sys
import os
import dotenv
from datetime import datetime, timedelta
import logging
import json
import asyncio


backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(backend_path)

import baml_client as client

from baml_client.async_client import b as b_async  # TODO use async_client
from baml_client import reset_baml_env_vars
from baml_client.types import Tile, ToolType

from api.six import call_ohlcv, call_searchwithcriteria, fetch_asset_allocation

TOOLS = {
    ToolType.OHLCV: call_ohlcv,
    ToolType.SEARCHWITHCRITERIA: call_searchwithcriteria,
    ToolType.FETCH_ASSET_ALLOCATION: fetch_asset_allocation,
}


log_file_path = os.path.join(backend_path, "generate_canvas.log")
logging.basicConfig(
    filename=log_file_path,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
console_handler.setFormatter(console_formatter)

logging.getLogger().addHandler(console_handler)


dotenv.load_dotenv()

reset_baml_env_vars(dict(os.environ))


class DataTile(Tile):
    data: list | dict | str | None
    position: int


async def generate_canvas(user_input: str, canvas_context: str = "") -> list[DataTile]:
    logging.info(
        "Generating canvas with user input: %s and context: %s",
        user_input,
        canvas_context,
    )
    canvas = client.b.GenerateCanvas(user_input, canvas_context)
    logging.info("Generated canvas: %s", canvas)
    canvas_data = []
    tasks_generate_call = []
    for tile in canvas.tiles:
        use_date = tile.type in ["LINE", "CANDLE"]
        logging.debug("Scheduling tool call for tile: %s", tile)
        tasks_generate_call.append(
            generate_tool_call(tile=tile, context="", date=use_date)
        )

    # Await all tasks concurrently.
    tool_calls = await asyncio.gather(*tasks_generate_call)

    tasks_perform_call = [perform_tool_call(tool_call) for tool_call in tool_calls]
    tasks_perform_result = await asyncio.gather(
        *tasks_perform_call, return_exceptions=True
    )

    for tile, tool_call, data in zip(canvas.tiles, tool_calls, tasks_perform_result):
        logging.info("Generated tool call: %s", tool_call)
        if isinstance(data, Exception):
            logging.error("Error performing tool call for tile %s: %s", tile, data)
            continue
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


async def generate_tool_call(tile: Tile, context: str = "", date: bool = False) -> str:
    if date:
        current_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    else:
        current_date = ""

    tool_call = await b_async.GenerateToolCalls(
        title=tile.title,
        type=tile.type.value,
        description=tile.content,
        context=context,
        date=current_date,
    )
    return tool_call


async def perform_tool_call(tool_call) -> str:
    # Retrieve the function from TOOLS using the tool type.
    try:
        function = TOOLS[tool_call.type]
    except KeyError as e:
        raise KeyError(f"Tool type '{tool_call.type}' not found in TOOLS. ({e})")

    # Build the inputs dictionary from tool_call.inputs.
    inputs_dict = {}
    for item in tool_call.inputs:
        try:
            key, value = item.split("=", 1)
            inputs_dict[key] = value
        except ValueError as e:
            raise ValueError(
                f"Unable to parse input '{item}'. Expected format key=value. ({e})"
            )

    # Execute the tool function with the provided inputs.
    try:
        response = await function(**inputs_dict)
    except Exception as e:
        raise Exception(
            f"Error executing tool '{tool_call.type}' with inputs {inputs_dict}: {e}"
        )

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
    canvas = asyncio.run(generate_canvas(user_input, context))


if __name__ == "__main__":
    main()
