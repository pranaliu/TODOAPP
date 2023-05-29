# TODOAPP
TO DO APP with Docker Compose
# Pre-Requisit : 
1. Docker is installed from docker hub and docker compose is installed as part of set up
2. Fusion Auth SandBox or Docker or FastPath account set up.
3. Create and Configure "TODO" Application under Fusion Auth config with Oauth.
4. Add self service registration for users if needed, under application registration. 
4. Create User Roles - "Admin" (Super User) and "User" (regular user) for Application.
4. Create Users, assign user roles and add them to TODO Application as registered user.
5. Update issuer to be fusionauth url (because of oidc) in the tenant settings.
6. For above steps, Refer Documentation -  https://fusionauth.io/docs/v1/tech/5-minute-setup-guide
   and https://fusionauth.io/docs/v1/tech/apis/registrations#retrieve-a-user-registration
7. Application security configuration. Use this for TODO application. - https://fusionauth.io/docs/v1/tech/tutorials/application-authentication-tokens 
# Run the app with following steps -
1. Change .env file with your Fusion Auth account clientID, ClientSecret and BaseURL.
2. Run the app with docker compose -
 "docker-compose -f docker-compose-volume.yaml up -d"
3. View application running on http://localhost:3000/
4. View Mongo DB running on http://localhost:8080/
   DB name : test
   DB collection : TODODB

# Support :
1. FusionAuth support        : https://fusionauth.io/contact
2. Fusion Auth Documentation : https://fusionauth.io/docs/
3. ToDo App support          : pranaliu
