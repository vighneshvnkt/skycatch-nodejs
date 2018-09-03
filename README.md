This document describes the process of building the Skycatch-challenge app from source and running, all in the Docker environment.
The Skycatch-challenge source code includes a [Dockerfile](https://github.com/vighneshvnkt/skycatch-nodejs/blob/master/DockerFile).

## Requirements

[Docker](https://docs.docker.com/engine/installation/) 

## Building

Acquire the source code.

```
$ git clone https://github.com/vighneshvnkt/skycatch-nodejs.git
$ cd skycatch-nodejs
```

Make any changes to the source code if needed.
Then build the docker image.

```
$ docker build -t <skycatch-app-name> . -f DockerFile
```

This will download dependencies, compile the code, run tests, package, and place necessary components in appropriate places to build a minimal Docker image with the name `<skycatch-app-name>`.



## Running


Run a Docker container with the following command in terminal :

```
$ docker container run <skycatch-app-name>
```

