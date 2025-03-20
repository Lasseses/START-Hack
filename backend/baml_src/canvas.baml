class Canvas {
  tiles Tile[] @description("A list of tiles on the canvas.")
}

class Tile {
  title string @description("A title that describes the content of this tile.")
  type DiagramType @description("The type of diagram or content to be displayed in this tile.")
  content string @description("A short description of the content to be displayed in this tile. This should contain specific information on the data to be displayed.")
  // position int @skip  // position is resolved elsewhere
  // data string @skip  // this will be set later based on six api
}

enum DiagramType {
  LINE @description("Line chart diagram time")
  // BAR @description("Bar chart diagram")
  PIE @description("Pie chart diagram asset allocaiton")
  CANDLE @description("Candle chart diagram time")
  // KPI @description("A simple KPI number")
  TABLE @description("A table with data criterion")
}
// add more details how complex these charts can be 
// are certain tools connected to certain diagram types?


function GenerateCanvas(user_input: string, context: string ) -> Canvas {
  client "CustomGemini2Flash" 
  prompt #"
    Based on the following user input, generate a canvas that displays the requested information in tiles that each contain an appropriate diagrams.
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
      Generate a canvas with an overview that shows the development of stock price performance in europe with a focus on the technological sector. I would like to include the company SAP and another european tech company that is on the rise.
    "#
    context #" "#
  }
}
