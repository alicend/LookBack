package controllers

import (
	"net/http"
	"path"
	"strconv"
	"errors"
	"strings"
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
		log.Printf("createTaskInput: %v", createTaskInput.Estimate)
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
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
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	tasks, err := models.FetchTaskBoardTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tasks"   : tasks,
	})
}

func (handler *Handler) GetTaskBoardTasksHandler(c *gin.Context) {

	tasks, err := models.FetchTaskBoardTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks"   : tasks,  // tasksをレスポンスとして返す
	})
}

func (handler *Handler) GetLookBackTasksHandler(c *gin.Context) {

	tasks, err := models.FetchLookBackTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
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
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// StartDateをstring型から*time.Time型に変換
	layout1 := "2006-01-02T15:04:05Z07:00"
	layout2 := "2006-01-02"

	startDate, err := time.Parse(layout1, updateTaskInput.StartDate)
	if err != nil { // レイアウト１での変換に失敗すれば、レイアウト２の変換にトライ
		startDate, err = time.Parse(layout2, updateTaskInput.StartDate)
		if err != nil { // ２種類に変換に失敗すればエラーを返す
			log.Printf("Invalid date format: %v", err)
			respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "開始日のフォーマットが不正です")
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

	// URLからtaskのidを取得
	id, err := getIdFromURLTail(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	err = updateTask.UpdateTask(handler.DB, id)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	tasks, err := models.FetchTaskBoardTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks"   : tasks,  // tasksをレスポンスとして返す
	})
}

func (handler *Handler) UpdateTaskToMoveToCompletedHandler(c *gin.Context) {
	var updateTaskInput models.TaskInput
	if err := c.ShouldBindJSON(&updateTaskInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	updateTask := &models.Task{
		Status:      updateTaskInput.Status,
	}

	// URLからtaskのidを取得
	id, err := getIdFromSecondLastPartOfURL(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	err = updateTask.UpdateTask(handler.DB, id)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	tasks, err := models.FetchLookBackTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tasks"   : tasks,  // tasksをレスポンスとして返す
	})
}

func (handler *Handler) DeleteTaskHandler(c *gin.Context) {

	// URLからtaskのidを取得
	id, err := getIdFromURLTail(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	deleteTask := &models.Task{}

	err = deleteTask.DeleteTask(handler.DB, id)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	tasks, err := models.FetchTaskBoardTasks(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
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

func getIdFromURLTail(c *gin.Context)(int, error) {

	idStr := path.Base(c.Request.URL.Path)
	id, err := strconv.Atoi(idStr)

	if err != nil {
		log.Printf("URLのIDのフォーマットが不正です")
		log.Printf("Invalid date format: %v", err)
		return id, err
	}

	return id, nil
}
func getIdFromSecondLastPartOfURL(c *gin.Context) (int, error) {
	// URLのパスをスラッシュで分割
	parts := strings.Split(c.Request.URL.Path, "/")

	// 最低でも2つの部分（例：["taskId", "to-completed"]）が存在することを確認
	if len(parts) < 2 {
			log.Printf("URLのフォーマットが不正です")
			return 0, errors.New("invalid URL format")
	}

	// パスの末尾から2番目の部分をIDとして取得
	idStr := parts[len(parts)-2]
	id, err := strconv.Atoi(idStr)

	if err != nil {
			log.Printf("URLのIDのフォーマットが不正です")
			log.Printf("Invalid date format: %v", err)
			return id, err
	}

	return id, nil
}