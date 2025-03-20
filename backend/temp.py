

user_query

tile_requirements = get_tile_requirements(user_query)

for req in tile_requirements:
    six_api_query = get_six_api_query(req)  
    frontend_api_query = get_frontend_api_query(six_api_query)
    send(frontend_api_query)


    