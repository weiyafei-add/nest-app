server {
listen 8989 ssl http2;

    ssl_certificate      /etc/nginx/certification/certification.crt;
    ssl_certificate_key  /etc/nginx/certification/private.key;

    server_name 116.204.21.112;
    access_log   /var/log/nginx/nginx.vhost.access.log;
    error_log    /var/log/nginx/nginx.vhost.error.log;

    location / {
        proxy_pass http://localhost:3636;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

}

<!--  -->

server {
listen 8990 ssl http2;

    ssl_certificate      /etc/nginx/certification/certification.crt;
    ssl_certificate_key  /etc/nginx/certification/private.key;

    server_name 116.204.21.112;
    access_log   /var/log/nginx/nginx.vhost.access.log;
    error_log    /var/log/nginx/nginx.vhost.error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

}

<!--  -->

server {

    listen 443 ssl http2;


    ssl_certificate      /etc/nginx/certification/certification.crt;
    ssl_certificate_key  /etc/nginx/certification/private.key;


    server_name 116.204.21.112;
    access_log   /var/log/nginx/nginx.vhost.access.log;
    error_log    /var/log/nginx/nginx.vhost.error.log;

    location / {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow_Credentials' 'true';
        add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range';
        add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH';
        root         /usr/web_system/meeting-reserve-system-frontend/dist ;
        index        index.html;
        try_files $uri $uri/ /index.html;
        # proxy_set_header X-Real-IP $remote_addr;
        # proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # proxy_set_header Host  $http_host;
        # proxy_set_header X-Nginx-Proxy true;
        # proxy_http_version 1.1;
        # # Node.js的本机地址，注意端口
        # proxy_pass    http://localhost:9000;
    }

    location /end {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host  $http_host;
        proxy_set_header X-Nginx-Proxy true;
        proxy_http_version 1.1;
        rewrite ^/end(/.*)$ $1 break;
        # Node.js的本机地址，注意端口
        proxy_pass    http://localhost:3000;
    }

    # location /notice_ws {
    #     rewrite ^/notice_ws(/.*)$ $1 break;
    #     proxy_pass http://localhost:3636;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection "Upgrade";
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # }


    # location /websocket {
    #     rewrite ^/websocket(/.*)$ $1 break;
    #     proxy_pass http://localhost:3000;
    #      proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection "Upgrade";
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # }

}
