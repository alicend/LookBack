package controllers

import (
	"fmt"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/utils"
)

func TestCreateCategoryHandler(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	mockMailSender := &MockMailSender{}
	handler := &Handler{
		DB:         db,
		MailSender: mockMailSender,
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/categories", handler.CreateCategoryHandler)

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
		tokenString, _ := utils.GenerateSessionToken(uint(user.ID))

		categoryInput := models.CategoryInput{Category: "New Category"}
		body, _ := json.Marshal(categoryInput)
		req, _ := http.NewRequest(http.MethodPost, "/categories", bytes.NewBuffer(body))
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
		var latestCategory models.Category
		db.Order("created_at desc").First(&latestCategory)
        db.Unscoped().Delete(&latestCategory)

		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestGetCategoryHandler(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	handler := &Handler{
		DB: db,
	}

	tokenString, _ := utils.GenerateSessionToken(uint(1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/categories", handler.GetCategoryHandler)

	t.Run("成功", func(t *testing.T) {

		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}

		req, _ := http.NewRequest(http.MethodGet, "/categories", nil)
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		} else {
			var response map[string]interface{}
			err := json.Unmarshal(resp.Body.Bytes(), &response)
			if err != nil {
				t.Errorf("Failed to unmarshal response: %v", err)
			}

			// 応答にカテゴリが含まれていることを確認する
			if _, ok := response["categories"]; !ok {
				t.Errorf("Response does not contain categories")
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestUpdateCategoryHandler(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	handler := &Handler{
		DB: db,
	}

	tokenString, _ := utils.GenerateSessionToken(uint(1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.PUT("/categories/:id", handler.UpdateCategoryHandler)

	t.Run("成功", func(t *testing.T) {
		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}

		categoryInput := models.CategoryInput{Category: "Updated Category"}
		body, _ := json.Marshal(categoryInput)
		req, _ := http.NewRequest(http.MethodPut, fmt.Sprintf("/categories/%d", category.ID), bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		} else {
			var response map[string]interface{}
			err := json.Unmarshal(resp.Body.Bytes(), &response)
			if err != nil {
				t.Errorf("Failed to unmarshal response: %v", err)
			}

			// 応答にカテゴリとタスクが含まれていることを確認する
			if _, ok := response["categories"]; !ok {
				t.Errorf("Response does not contain categories")
			}
			if _, ok := response["tasks"]; !ok {
				t.Errorf("Response does not contain tasks")
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&userGroup)
	})
}


func TestDeleteCategoryHandler(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	handler := &Handler{
		DB: db,
	}

	tokenString, _ := utils.GenerateSessionToken(uint(1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.DELETE("/categories/:id", handler.DeleteCategoryHandler)

	t.Run("成功", func(t *testing.T) {
		// テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

		category := &models.Category{
			Category:    "Test Category",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&category).Error; err != nil {
			t.Fatalf("failed to create category: %v", err)
		}

		req, _ := http.NewRequest(http.MethodDelete, fmt.Sprintf("/categories/%d", category.ID), nil)
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		} else {
			var response map[string]interface{}
			err := json.Unmarshal(resp.Body.Bytes(), &response)
			if err != nil {
				t.Errorf("Failed to unmarshal response: %v", err)
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&category)
		db.Unscoped().Delete(&userGroup)
	})
}
