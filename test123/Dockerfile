FROM node:10

# Create app directory
WORKDIR /usr/src/app
RUN ls
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY test123/package.json /usr/src/app

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY test123/ .

EXPOSE 3000
CMD [ "npm", "start" ]