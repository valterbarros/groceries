# groceries
An app to organize your buy groceries.

# Docker

```
# Build
docker build -t groceries .

# Run

./run.sh

# attach to an already running container

docker exec -it groceries-container /bin/bash
```

# Envs

Create the env file

```
touch env.js

# paste

export const credectials = {
    development: {
        api: "<link to api>"
    }
}
```

# Install and build
```
npm install
npm run dev
```
