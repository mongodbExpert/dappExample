# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR ./
# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 3000
EXPOSE 3001

# Define the command to run your application
CMD ["node", "test.js"]
