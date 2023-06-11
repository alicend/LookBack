package router

import (
	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
	"github.com/alicend/LookBack/app/config"
	"github.com/alicend/LookBack/app/controllers"
	"github.com/alicend/LookBack/app/middleware"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	// CORS設定
	config.CorsSetting(r)

	handler := controllers.Handler{
		DB: db,
	}

	// ルーティング設定
	api := r.Group("/api")
	auth := api.Group("/auth")
	{
		auth.POST("/signup", handler.SignUpHandler)
		auth.POST("/login", handler.LoginHandler)
		auth.Use(middleware.AuthMiddleware)
		{
			auth.GET("/logout", handler.LogoutHandler)
		}
	}

	todo := api.Group("/todo")
	{
		todo.POST("/", handler.CreateTaskHandler)
		todo.GET("/", handler.GetTaskHandler)
		todo.DELETE("/:taskId", handler.DeleteTaskHandler)
	}

	return r
}
