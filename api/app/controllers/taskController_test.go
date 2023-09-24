package controllers

import (
	"fmt"
	"time"
	"bytes"
	"errors"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/alicend/LookBack/app/utils"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/constant"
)

func TestCreateTaskHandler(t *testing.T) {
	// テスト用のデータベース接続をセットアップ
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}
	handler := &Handler{DB: db}
	
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/tasks", handler.CreateTaskHandler)

	t.Run("成功", func(t *testing.T) {

		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		user := &models.User{
			Name:        "Test User",
			Password:    "testPassword123",
			Email:       "test@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}
		tokenString, _ := utils.GenerateSessionToken(uint(user.ID))

		estimateValue := uint(5)
		taskInput := models.TaskInput{
			Task:        "Test Task",
			Description: "Test Description",
			CategoryID:  uint(category.ID),
			Status:      uint(1),
			Responsible: uint(user.ID),
			Estimate:    &estimateValue,
			StartDate:   "2023-01-01T00:00:00Z",
		}
		body, _ := json.Marshal(taskInput)
		req, _ := http.NewRequest(http.MethodPost, "/tasks", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		// 必要に応じて認証トークンを設定
		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}

		// 後処理: テスト用のデータを削除
		var latestTask models.Task
		db.Order("created_at desc").First(&latestTask)
        db.Unscoped().Delete(&latestTask)

		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}


func TestGetTaskBoardTasksHandler(t *testing.T) {
	// テスト用のデータベース接続をセットアップ
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}
	handler := &Handler{DB: db}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/tasks", handler.GetTaskBoardTasksHandler)

	t.Run("成功", func(t *testing.T) {
		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		user := &models.User{
			Name:        "Test User",
			Password:    "testPassword123",
			Email:       "test@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}
		task := &models.Task{
			Task:         "Sample Task",
			Description:  "This is a test task",
			Creator:      user.ID,
			CategoryID:   category.ID,
			Status:       1,
			Responsible:  user.ID,
			Estimate:     ptrToUint(5),
			StartDate:    ptrToTime(time.Now()),
		}
		if err := db.Create(&task).Error; err != nil {
			t.Fatalf("failed to create task: %v", err)
		}
		tokenString, _ := utils.GenerateSessionToken(uint(user.ID))

		req, _ := http.NewRequest(http.MethodGet, "/tasks", nil)
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
		}

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&task)
		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestGetLookBackTasksHandler(t *testing.T) {
	// テスト用のデータベース接続をセットアップ
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}
	handler := &Handler{DB: db}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/lookback-tasks", handler.GetLookBackTasksHandler)

	t.Run("成功", func(t *testing.T) {
		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		user := &models.User{
			Name:        "Test User",
			Password:    "testPassword123",
			Email:       "test@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}
		task := &models.Task{
			Task:         "Sample Task",
			Description:  "This is a test task",
			Creator:      user.ID,
			CategoryID:   category.ID,
			Status:       1,
			Responsible:  user.ID,
			Estimate:     ptrToUint(5),
			StartDate:    ptrToTime(time.Now()),
		}
		if err := db.Create(&task).Error; err != nil {
			t.Fatalf("failed to create task: %v", err)
		}
		tokenString, _ := utils.GenerateSessionToken(uint(user.ID))

		req, _ := http.NewRequest(http.MethodGet, "/lookback-tasks", nil)
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&task)
		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}


func TestUpdateTaskHandler(t *testing.T) {
	// テスト用のデータベース接続をセットアップ
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}
	handler := &Handler{DB: db}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.PUT("/tasks/:id", handler.UpdateTaskHandler)

	t.Run("成功", func(t *testing.T) {
		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		user1 := &models.User{
			Name:        "Test User",
			Password:    "testPassword123",
			Email:       "test1@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user1).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		user2 := &models.User{
			Name:        "Test User",
			Password:    "testPassword123",
			Email:       "test2@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user2).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}
		task := &models.Task{
			Task:         "Test Task",
			Description:  "This is a test task",
			Creator:      user1.ID,
			CategoryID:   category.ID,
			Status:       1,
			Responsible:  user1.ID,
			Estimate:     ptrToUint(5),
			StartDate:    ptrToTime(time.Now()),
		}
		if err := db.Create(&task).Error; err != nil {
			t.Fatalf("failed to create task: %v", err)
		}
		tokenString, _ := utils.GenerateSessionToken(uint(user1.ID))

		updateTaskInput := models.TaskInput{
			Task:        "Updated Task",
			Description: "Updated Description",
			CategoryID:  category.ID,
			Status:      2,
			Responsible: user2.ID,
			Estimate:    ptrToUint(5),
			StartDate:   "2023-01-01T00:00:00Z",
		}

		body, _ := json.Marshal(updateTaskInput)
		req, _ := http.NewRequest(http.MethodPut, fmt.Sprintf("/tasks/%d", task.ID), bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&task)
		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&user1)
		db.Unscoped().Delete(&user2)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestUpdateTaskToMoveToCompletedHandler(t *testing.T) {
	// テスト用のデータベース接続をセットアップ
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}
	handler := &Handler{DB: db}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.PUT("/tasks/:id/move_to_completed", handler.UpdateTaskToMoveToCompletedHandler)

	t.Run("成功", func(t *testing.T) {
		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		user := &models.User{
			Name:        "Test User",
			Password:    "testPassword123",
			Email:       "test@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}
		task := &models.Task{
			Task:         "Sample Task",
			Description:  "This is a test task",
			Creator:      user.ID,
			CategoryID:   category.ID,
			Status:       1,
			Responsible:  user.ID,
			Estimate:     ptrToUint(5),
			StartDate:    ptrToTime(time.Now()),
		}
		if err := db.Create(&task).Error; err != nil {
			t.Fatalf("failed to create task: %v", err)
		}
		tokenString, _ := utils.GenerateSessionToken(uint(user.ID))

		updateTaskInput := models.TaskInput{
			Task:        "Updated Task",
			Description: "Updated Description",
			CategoryID:  category.ID,
			Status:      2,
			Responsible: user.ID,
			Estimate:    ptrToUint(5),
			StartDate:   "2023-01-01T00:00:00Z",
		}

		body, _ := json.Marshal(updateTaskInput)
		req, _ := http.NewRequest(http.MethodPut, fmt.Sprintf("/tasks/%d/move_to_completed", task.ID), bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}

		// ここでデータベースから更新されたタスクを取得し、期待される変更を確認
		var updatedTask models.Task
		if err := db.First(&updatedTask, task.ID).Error; err != nil {
			t.Fatalf("failed to fetch updated task: %v", err)
		}
		if updatedTask.Status != 2 {
			t.Errorf("Expected task status to be 2, got: %v", updatedTask.Status)
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&task)
		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestDeleteTaskHandler(t *testing.T) {
	// テスト用のデータベース接続をセットアップ
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}
	handler := &Handler{DB: db}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.DELETE("/tasks/:id", handler.DeleteTaskHandler)

	t.Run("成功", func(t *testing.T) {
		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		user := &models.User{
			Name:        "Test User",
			Password:    "testPassword123",
			Email:       "test@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}
		task := &models.Task{
			Task:         "Sample Task",
			Description:  "This is a test task",
			Creator:      user.ID,
			CategoryID:   category.ID,
			Status:       1,
			Responsible:  user.ID,
			Estimate:     ptrToUint(5),
			StartDate:    ptrToTime(time.Now()),
		}
		if err := db.Create(&task).Error; err != nil {
			t.Fatalf("failed to create task: %v", err)
		}
		tokenString, _ := utils.GenerateSessionToken(uint(user.ID))

		req, _ := http.NewRequest(http.MethodDelete, fmt.Sprintf("/tasks/%d", task.ID), nil)
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}

		// 確認: データベースからタスクが削除されたことを確認
		var deletedTask models.Task
		err := db.First(&deletedTask, task.ID).Error
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			t.Errorf("Expected task to be deleted, but found in database: %+v", deletedTask)
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&task)
		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}


func ptrToUint(u uint) *uint {
	return &u
}

func ptrToTime(t time.Time) *time.Time {
	return &t
}