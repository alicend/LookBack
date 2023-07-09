package router

import (
	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
	"github.com/alicend/LookBack/app/config"
	"github.com/alicend/LookBack/app/controllers"
	"github.com/alicend/LookBack/app/middleware"
	"log"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	// CORS設定
	config.CorsSetting(r)

	handler := controllers.Handler{
		DB: db,
	}
	log.Println("This is a simple log.")
	// ルーティング設定
	api := r.Group("/api")
	auth := api.Group("/auth")
	{
		auth.POST("/signup", handler.SignUpHandler)
		auth.POST("/login", handler.LoginHandler)
		auth.GET("/logout", handler.LogoutHandler)
	}

	tasks := api.Group("/tasks")
	tasks.Use(middleware.AuthMiddleware)
	{
		tasks.POST("", handler.CreateTaskHandler)
		tasks.GET("", handler.GetTaskHandler)
		tasks.DELETE("/:taskId", handler.DeleteTaskHandler)
		tasks.POST("/moveCard", handler.MoveCardHandler)
	}

	return r
}
