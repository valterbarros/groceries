#! /bin/bash

if docker images | grep "groceries\s"; then
    echo "groceries image exists"
else
    docker build -t groceries .
fi

docker run --rm -p 1234:1234 --name groceries-container -v ${PWD}:/app -it groceries /bin/bash
