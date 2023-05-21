package router

import (
	"github.com/gin-gonic/gin"
	"github.com/alicend/LookBack/app/controllers"
)

func NewRouter() *gin.Engine {
	r := gin.Default();
	r.GET("/", controllers.Example)
	r.GET("/test", controllers.Test)

	return r
}