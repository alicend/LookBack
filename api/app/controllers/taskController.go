package controllers

import (
	"net/http"
	"errors"
	"time"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/utils"
)

func (handler *Handler) CreateTaskHandler(c *gin.Context) {
	var createTaskInput models.CreateTaskInput
	if err := c.ShouldBindJSON(&createTaskInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}

	// StartDateをstring型から*time.Time型に変換
	layout := "2006-01-02T15:04:05Z07:00"
	startDate, err := time.Parse(layout, createTaskInput.StartDate)
	if err != nil {
		log.Printf("Invalid date format: %v", err)
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid date format")
		return
	}
	
	newTask := &models.Task{
		Task:        createTaskInput.Task,
		Description: createTaskInput.Description,
		Creator:     userID,
		CategoryID:  createTaskInput.CategoryID,
		Status:      createTaskInput.Status,
		Responsible: createTaskInput.Responsible,
		Estimate:    createTaskInput.Estimate,
		StartDate:   &startDate,
	}

	err = newTask.CreateTask(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to create task")
		return
	}

	tasks, err := models.FetchTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to fetch tasks")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tasks"   : tasks,
	})
}

func (handler *Handler) GetTaskHandler(c *gin.Context) {

	tasks, err := models.FetchTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to fetch tasks")
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks"   : tasks,  // tasksをレスポンスとして返す
	})
}

func (handler *Handler) UpdateTaskHandler(c *gin.Context) {

	tasks, err := models.FetchTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to fetch tasks")
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks"   : tasks,  // tasksをレスポンスとして返す
	})
}

func (handler *Handler) DeleteTaskHandler(c *gin.Context) {

	tasks, err := models.FetchTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to fetch tasks")
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks"   : tasks,  // tasksをレスポンスとして返す
	})
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
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
