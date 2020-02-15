FROM node:alpine as build
WORKDIR /project/simpleapp/app
RUN pwd
COPY package.json /project/simpleapp/app/package.json
COPY . /project/simpleapp/app
# ENV PATH /app/node_modules/.bin:$PATH

RUN npm i 
RUN npm start


FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
