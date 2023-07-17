package controllers

import (
	"net/http"
	"path"
	"strconv"
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
	var createTaskInput models.TaskInput
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
	var updateTaskInput models.TaskInput
	if err := c.ShouldBindJSON(&updateTaskInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}

	log.Printf("updateTaskInput: %v", updateTaskInput)

	// StartDateをstring型から*time.Time型に変換
	layout1 := "2006-01-02T15:04:05Z07:00"
	layout2 := "2006-01-02"

	startDate, err := time.Parse(layout1, updateTaskInput.StartDate)
	if err != nil { // レイアウト１での変換に失敗すれば、レイアウト２の変換にトライ
		startDate, err = time.Parse(layout2, updateTaskInput.StartDate)
		if err != nil { // ２種類に変換に失敗すればエラーを返す
			log.Printf("Invalid date format: %v", err)
			respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid date format")
			return
		}
	}
	
	updateTask := &models.Task{
		Task:        updateTaskInput.Task,
		Description: updateTaskInput.Description,
		CategoryID:  updateTaskInput.CategoryID,
		Status:      updateTaskInput.Status,
		Responsible: updateTaskInput.Responsible,
		Estimate:    updateTaskInput.Estimate,
		StartDate:   &startDate,
	}

	// URLからtaskのIDを取得
	idStr := path.Base(c.Request.URL.Path)
	id, err := strconv.Atoi(idStr)
		if err != nil {
			log.Printf("URLのIDのフォーマットが不正です")
			log.Printf("Invalid date format: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
			return
		}

	err = updateTask.UpdateTask(handler.DB, id)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to update task")
		return
	}

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
