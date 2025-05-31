FROM golang:1.23.4-alpine

RUN apk update && \
    apk add --no-cache \
        vim \
        make && \
    rm -rf /var/cache/apk/*

RUN go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
