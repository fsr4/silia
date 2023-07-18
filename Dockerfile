FROM node:lts-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ ./
EXPOSE 9999
EXPOSE 9229
ENTRYPOINT ["npm", "run", "watch"]

FROM node:lts-alpine
WORKDIR /server
COPY --from=build /app/package*.json ./
RUN npm ci --only=production
COPY --from=build /app/ ./
EXPOSE 9999
ENTRYPOINT ["npm", "run", "start"]
