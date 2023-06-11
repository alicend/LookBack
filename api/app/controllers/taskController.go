package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/utils"
)

func (handler *Handler) CreateTaskHandler(c *gin.Context) {

	// Taskを取得
	var createTaskInput models.CreateTaskInput
	if err := c.ShouldBindJSON(&createTaskInput); err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}

	// ユーザIDをCookieから取得
	tokenString, err := c.Cookie(constant.JWT_TOKEN_NAME)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusUnauthorized, err.Error(), "Unauthorized")
		return
	}

	// token, _ := utils.ParseToken(tokenString)
	_, _ = utils.ParseToken(tokenString)
	
	// newTask := &models.Task{
	// 	Task:   createTaskInput.Task,
	// 	UserID: userID,
	// }

	// task, err := newTask.CreateTask(handler.DB)
	// if err != nil {
	// 	respondWithError(c, http.StatusBadRequest, "Failed to create task")
	// 	return
	// }

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully created task",
		// "task"   : task,
	})
}

func (handler *Handler) GetTaskHandler(c *gin.Context) {
	var loginInput models.LoginInput
	if err := c.ShouldBind(&loginInput); err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}

	// メールアドレスでユーザを取得
	user, err := models.FindUserByEmail(handler.DB, loginInput.Email)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Failed to find user")
		return
	}

  // 入力されたパスワードとIDから取得したパスワードが等しいかを検証
	if !user.VerifyPassword(loginInput.Password) {
		respondWithError(c, http.StatusUnauthorized, "Password is invalid")
		return
	}

	// クッキーにJWT(中身はユーザID)をセットする
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to sign up")
		return
	}

	// JWT_TOKEN_NAMEはクライアントで設定した名称
	c.SetCookie(constant.JWT_TOKEN_NAME, token, constant.COOKIE_MAX_AGE, "/", "localhost", false, true)
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully got task",
	})
}

func (handler *Handler) DeleteTaskHandler(c *gin.Context) {
	// Clear the cookie named "access_token"
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", "localhost", false, true)

	// Return success message
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully deleted task",
	})
}