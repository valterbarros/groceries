# groceries
An app to organize your buy groceries

# Docker

```
# Build
docker build -t groceries .

# Run
docker run -p 1234:1234 --rm --name groceries-container -v ${PWD}:/opt/app -it groceries /bin/bash

# Or just run the script

./groceries-run.sh

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
