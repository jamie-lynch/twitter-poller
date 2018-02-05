#FROM node:boron
FROM node:6.10.3
RUN npm i -g npm3 && npm3 -g uninstall npm
RUN npm3 i -g npm@5.0.3
RUN npm -v

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .

RUN npm update -g npm

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3001 80 443 22


# change to node directory to start server
# Start app
CMD [ "npm", "start" ]
