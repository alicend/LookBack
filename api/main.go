package main

import (
	//"github.com/gin-gonic/gin"
	"github.com/alicend/LookBack/app/config"
	"github.com/alicend/LookBack/app/router"
)

func main() {
	// database.DBMigrate(DBConnect())
	database.DBConnect()

	r := router.NewRouter()
	r.Run()
}