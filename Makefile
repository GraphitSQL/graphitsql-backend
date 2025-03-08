
PROJECT_NAME := graphitsql-backend
RUN := run --rm

DOCKER_COMPOSE_FILES := -f docker-compose.yml

DOCKER_COMPOSE := docker-compose $(DOCKER_COMPOSE_FILES) --project-name $(PROJECT_NAME)
DOCKER_COMPOSE_RUN := $(DOCKER_COMPOSE) $(RUN)

DB_SCHEMA := db/schema.sql

provision: rebuild-docker migrate dump-schema

install:
	${DOCKER_COMPOSE_RUN} app npm install

build:
	${DOCKER_COMPOSE_RUN} app nest build

app:
	docker-compose up app -d

restart-app:
	docker-compose up app -d --force-recreate
	
sh:
	${DOCKER_COMPOSE_RUN} app /bin/sh

down:
	${DOCKER_COMPOSE} down

down-v:
	${DOCKER_COMPOSE} down -v

build-docker:
	${DOCKER_COMPOSE} build

rebuild-docker:
	${DOCKER_COMPOSE} down app --rmi 'local'
	${DOCKER_COMPOSE} build --force-rm

logs:
	${DOCKER_COMPOSE} logs

psql:
	${DOCKER_COMPOSE_RUN} app psql -h db -U postgres graphitsql

recreate-db:
	${DOCKER_COMPOSE_RUN} app psql -h db -U postgres -c "DROP DATABASE IF EXISTS graphitsql;"
	${DOCKER_COMPOSE_RUN} app psql -h db -U postgres -c "CREATE DATABASE graphitsql;"
	${DOCKER_COMPOSE_RUN} app psql -h db -U postgres graphitsql -f ${DB_SCHEMA}

migrate:
	${DOCKER_COMPOSE_RUN} app npm run migration:up

migrate-down:
	${DOCKER_COMPOSE_RUN} app npm run migration:down
	
dump-schema:
	${DOCKER_COMPOSE_RUN} app pg_dump -h db -U postgres graphitsql -s -x -O -f ${DB_SCHEMA}

migration-create:
	${DOCKER_COMPOSE_RUN} app npm run typeorm migration:create ./db/migrations/$(name)
