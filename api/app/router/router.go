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
		auth.POST("/signup/request", handler.SendSignUpEmailHandler)
		auth.POST("/signup", handler.SignUpHandler)
		auth.POST("/login", handler.LoginHandler)
		auth.GET("/logout", handler.LogoutHandler)
	}

	tasks := api.Group("/tasks")
	tasks.Use(middleware.AuthMiddleware)
	{
		tasks.GET("/task-board", handler.GetTaskBoardTasksHandler)
		tasks.GET("/look-back", handler.GetLookBackTasksHandler)
		tasks.POST("", handler.CreateTaskHandler)
		tasks.PUT("/:taskId", handler.UpdateTaskHandler)
		tasks.PUT("/:taskId/to-completed", handler.UpdateTaskToMoveToCompletedHandler)
		tasks.DELETE("/:taskId", handler.DeleteTaskHandler)
	}

	category := api.Group("/categories")
	category.Use(middleware.AuthMiddleware)
	{
		category.GET("", handler.GetCategoryHandler)
		category.POST("", handler.CreateCategoryHandler)
		category.PUT("/:categoryId", handler.UpdateCategoryHandler)
		category.DELETE("/:categoryId", handler.DeleteCategoryHandler)
	}

	users := api.Group("/users")
	users.PUT("/password", handler.ResetPasswordHandler)
	users.POST("/password/request", handler.SendEmailResetPasswordHandler)
	users.Use(middleware.AuthMiddleware)
	{
		users.GET("", handler.GetUsersAllHandler)
		users.GET("/me", handler.GetCurrentUserHandler)
		users.PUT("/me/email/request", handler.SendEmailUpdateEmailHandler)
		users.PUT("/me/email", handler.UpdateCurrentUserEmailHandler)
		users.PUT("/me/name", handler.UpdateCurrentUsernameHandler)
		users.PUT("/me/password", handler.UpdateCurrentUserPasswordHandler)
		users.PUT("/me/user-group", handler.UpdateCurrentUserGroupHandler)
		users.DELETE("/me", handler.DeleteCurrentUserHandler)
	}

	userGroup := api.Group("/user-groups")
	userGroup.GET("", handler.GetUserGroupsHandler)
	userGroup.POST("", handler.CreateUserGroupHandler)
	userGroup.Use(middleware.AuthMiddleware)
	{
		userGroup.PUT("/:user-groupsId", handler.UpdateUserGroupHandler)
		userGroup.DELETE("/:user-groupsId", handler.DeleteUserGroupHandler)
	}

	return r
}
