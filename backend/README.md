Habe mir deren API ein bisschen angeschaut aber hatte das Problem, dass deren Doku nicht erwähnt, welche Parameter man den Queries mitgeben kann.

Beispiel: Doku von searchwithcriteria-endpoint:
Search with criteria. Query is a string with a dict schema like: '{"criteria": "logical value"}'.
For example: '{"ebitda": "is positive", "employees": "more than 10000"}'.
'{"criteria": "logical value"}'.

-> Das Beispiel ist nett und funktioniert auch aber ich habe nicht rausgefunden, welche anderen "criteria" man verwenden kann und welche "logical values" jeweils möglich sind. Das ist natürlich schlecht, weil wir dem Query-LLM ja irgendwie sagen müssen, welche Daten prinzipiell per API zur Verfügung stehen. Zur Zeit muss man raten und wenn man Glück hat funktionierts aber wenn man Pech hat, sagt er einem nur, dass er die Daten nicht hat.

## Install with Poetry

```
cd backend
poetry install
poetry env activate
# copy past source ...venv/bin/activate command
```
