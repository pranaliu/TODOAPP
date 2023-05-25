# TODOAPP
TO DO APP with Docker Compose
# Pre-Requisit : 
# 1. Docker is installed from docker hub and docker compose is installed as part of set up
# 2. Fusion Auth SandBox or Docker or FastPath account set up.
# 3. Configure "TODO" Application under Fusion Auth config with Oauth. 
# For Step2 and step3, Refer Documentation -  https://fusionauth.io/docs/v1/tech/5-minute-setup-guide 
# Run the app with following steps -
# Change .env file with your Fusion Auth account clientID, ClientSecret and BaseURL.
1. If you want to rebuild docker image locally for use - 
    "docker build -t pranaliaws/todoapp:1.0 ." 
   Else it will pull docker hub public image
2. Run the app with docker compose -
 "docker-compose -f docker-compose-volume.yaml up -d"
3. View application running on http://localhost:3000/
4. View Mongo DB running on http://localhost:8080/
   DB name : test
   DB collection : TODODB

