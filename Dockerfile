# First line of every dockerfile contains FROM "image"; install node
FROM node:latest

# Define variables to access mongodb
ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password

# Runs directly inside of the container
RUN mkdir -p /home/app/

# Executes on the host machine
COPY ./local-app /home/app/

# set default dir so that next commands executes in /home/app dir
WORKDIR /home/app/

# will execute npm install in /home/app because of WORKDIR
RUN npm install

#Install mongoose
RUN npm install mongoose

# no need for /home/app/server.js because of WORKDIR
CMD ["node", "server.js"]

