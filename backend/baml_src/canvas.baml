class Canvas {
  tiles Tile[] @description("A list of tiles on the canvas.")
}

class Tile {
  title string @description("A title that describes the content of this tile.")
  type DiagramType @description("The type of diagram or content to be displayed in this tile.")
  content string @description("A short description of the content to be displayed in this tile. This should contain specific information on the data to be displayed. It needs to consider what the diagram type is suitable to show.")
}

enum DiagramType {
  LINE @description("Line chart diagram time. This can show historical stock price data.")
  PIE @description("A pie chart diagram. This can show asset allocation of a person.")
  CANDLE @description("Candle chart diagram. This can show historical stock price data.")
  TABLE @description("A table. This can be used to find companies or stocks which fulfill certain criteria. The tabel will then show the values of these criteria.")
}
// line: call_ohlcv
// pie: fetch_asset_allocation
// candle: call_ohlcv
// table: call_searchwithcriteria
// KPI @description("A simple KPI number") - not working yet
// BAR @description("Bar chart diagram") - not working yet


function GenerateCanvas(user_input: string, context: string ) -> Canvas {
  client "CustomGemini2Flash" 
  prompt #"
    Based on the following user input, generate a canvas that displays the requested information in tiles that each contain an appropriate diagram.
    {{ user_input }}

    {% if context %}
    Use the following additional context:
    {{ context }}
    {% endif %}

    {{ ctx.output_format }}
  "#
}


test test_canvas {
  functions [GenerateCanvas]
  args {
    user_input #"
    show me how the stock price of Apple and one competitor have developed over the past four weeks. also find a company that has a similar price to earnings ratio to apple."#
    context #"use 2 - 5 tiles as needed."#
  }
}
