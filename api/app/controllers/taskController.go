package controllers

import (
	"net/http"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/utils"
)

func (handler *Handler) CreateTaskHandler(c *gin.Context) {
	var createTaskInput models.CreateTaskInput
	if err := c.ShouldBindJSON(&createTaskInput); err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}
	
	newTask := &models.Task{
		Content: createTaskInput.Content,
		UserID:  userID,
		Status:  createTaskInput.Status,
		Index:   createTaskInput.Index,
	}

	task, err := newTask.CreateTask(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to create task")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully created task",
		"task"   : task,
	})
}

func (handler *Handler) GetTaskHandler(c *gin.Context) {
	var loginInput models.LoginInput
	if err := c.ShouldBind(&loginInput); err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}

	user, err := models.FindUserByEmail(handler.DB, loginInput.Email)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Failed to find user")
		return
	}

	if !user.VerifyPassword(loginInput.Password) {
		respondWithError(c, http.StatusUnauthorized, "Password is invalid")
		return
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to sign up")
		return
	}

	c.SetCookie(constant.JWT_TOKEN_NAME, token, constant.COOKIE_MAX_AGE, "/", "localhost", false, true)
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully got task",
	})
}

func (handler *Handler) DeleteTaskHandler(c *gin.Context) {
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully deleted task",
	})
}

// Extracts the user ID from the JWT in the cookie
func extractUserID(c *gin.Context) (uint, error) {
	tokenString, err := c.Cookie(constant.JWT_TOKEN_NAME)
	if err != nil {
		return 0, err
	}

	token, _ := utils.ParseToken(tokenString)
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("failed to parse claims")
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, errors.New("failed to parse user ID")
	}

	return uint(userIDFloat), nil
}
