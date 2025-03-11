FROM nginxproxy/nginx-proxy
COPY vhost.d/default /etc/nginx/vhost.d/default
COPY custom.conf /etc/nginx/conf.d/custom.conf
COPY nginx.conf /etc/nginx/nginx.conf
RUN apt-get update && apt-get install -y procps
RUN mkdir -p /home/app/web/static
RUN chmod -R 755 /home/app/web/static
