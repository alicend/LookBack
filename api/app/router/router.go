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
		auth.GET("/logout", handler.LogoutHandler)
	}

	tasks := api.Group("/tasks")
	tasks.Use(middleware.AuthMiddleware)
	{
		tasks.GET("", handler.GetTaskHandler)
		tasks.POST("", handler.CreateTaskHandler)
		tasks.PUT("/:taskId", handler.UpdateTaskHandler)
		tasks.DELETE("/:taskId", handler.DeleteTaskHandler)
	}

	category := api.Group("/category")
	category.Use(middleware.AuthMiddleware)
	{
		category.GET("", handler.GetCategoryHandler)
		category.POST("", handler.CreateCategoryHandler)
		category.PUT("/:taskId", handler.UpdateCategoryHandler)
		category.DELETE("/:taskId", handler.DeleteCategoryHandler)
	}

	users := api.Group("/users")
	users.Use(middleware.AuthMiddleware)
	{
		users.GET("", handler.GetUsersAllHandler)
		users.GET("/me", handler.GetCurrentUserHandler)
		users.PUT("/me", handler.UpdateCurrentUserHandler)
		users.DELETE("/me", handler.DeleteCurrentUserHandler)
	}

	return r
}
