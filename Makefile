.PHONY: up down build rm exec deploy

up:
	docker-compose up --remove-orphans
down:
	docker compose down
build:
	docker build -t draft-ssr:latest .
rm:
	docker rm -f app-ssr
exec:
	docker exec -it app-ssr sh
