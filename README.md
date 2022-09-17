# cryptocase-server

sudo ssh -i cryptocase.pem ubuntu@3.111.46.13

docker ps -q --filter "status=exited" | xargs --no-run-if-empty docker rm;
docker volume ls -qf dangling=true | xargs -r docker volume rm;