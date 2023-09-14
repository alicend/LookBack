FROM golang:1.18-alpine

WORKDIR /go/src/
COPY . .

RUN apk upgrade --update && \
    apk --no-cache add git gcc musl-dev

RUN go mod tidy

RUN go get github.com/gin-gonic/gin \
    github.com/jinzhu/gorm \
    github.com/jinzhu/gorm/dialects/mysql \
    github.com/DATA-DOG/go-sqlmock \
    github.com/joho/godotenv \
    github.com/resendlabs/resend-go

RUN go mod tidy

RUN go get -u github.com/cosmtrek/air && \
    go build -o /go/bin/air github.com/cosmtrek/air

RUN go get github.com/go-delve/delve/cmd/dlv@latest && \
    go build -o /go/bin/dlv github.com/go-delve/delve/cmd/dlv

RUN go get -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

CMD ["air", "-c", ".air.toml"]