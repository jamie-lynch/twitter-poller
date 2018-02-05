# use the latest node image as a base
FROM node:6.11.0

# set the log level to warn
ENV NPM_CONFIG_LOGLEVEL warn

# install and configure serve
RUN npm i -g serve
CMD serve -s build -p 3000
EXPOSE 3000

# install project dependencies
COPY package.json .
RUN npm i

# copy everything else across
COPY . .

# build the app
RUN npm run build
