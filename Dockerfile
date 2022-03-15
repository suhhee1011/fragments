#Stage1 - Intall node and npm libraries for production
#Current Node version
FROM node:16.14-alpine@sha256:2c6c59cf4d34d4f937ddfcf33bab9d8bbad8658d1b9de7b97622566a52167f2b AS dependencies

#Meta data for image
LABEL maintainer="Kim Suhhee <skim402@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

ENV NODE_ENV=production

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir (/app)
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production
###########################################################################
#Stage2 - Deploy - Run and start server 
FROM node:16.14-alpine@sha256:2c6c59cf4d34d4f937ddfcf33bab9d8bbad8658d1b9de7b97622566a52167f2b AS production

WORKDIR /app


#Copy from dependencies stage
COPY --chown=node:node --from=dependencies app/node_modules  ./node_modules 

COPY --chown=node:node --from=dependencies app/package.json ./

# Copy src to /app/src/
COPY ./src ./src 

# We run our service on port 8080
EXPOSE 8080

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

#Health Check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
CMD curl --fail localhost:8080 || exit 1

USER node

# Run the server
CMD ["npm", "start"]
  