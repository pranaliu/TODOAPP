# TODOAPP
TO DO APP with Docker Compose
# Pre-Requisit : Docker is installed from docker hub and docker compose is installed as part of set up
# Run the app with following steps -
1. If you want to rebuild docker image locally for use - 
    "docker build -t pranaliaws/todoapp:1.0 ." 
   Else it will pull docker hub public image
2. Run the app with docker compose -
 "docker-compose -f docker-compose-volume.yaml up -d"
