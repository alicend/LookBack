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

	tokenString, _ := utils.GenerateSessionToken(uint(1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/categories", handler.CreateCategoryHandler)

	t.Run("成功", func(t *testing.T) {

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

		// 後処理: テスト用のカテゴリーを削除
		var latestCategory models.Category
		db.Order("created_at desc").First(&latestCategory)
        db.Unscoped().Delete(&latestCategory)
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
		// 前提条件: テスト用のカテゴリーを作成
		initialCategory := models.Category{Category: "Old Category"}
		db.Create(&initialCategory)

		categoryInput := models.CategoryInput{Category: "Updated Category"}
		body, _ := json.Marshal(categoryInput)
		req, _ := http.NewRequest(http.MethodPut, fmt.Sprintf("/categories/%d", initialCategory.ID), bytes.NewBuffer(body))
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

		// 後処理: テスト用のカテゴリーを削除
		db.Unscoped().Delete(&initialCategory)
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
		// 前提条件: テスト用のカテゴリーを作成
		initialCategory := models.Category{Category: "Test Category"}
		db.Create(&initialCategory)

		req, _ := http.NewRequest(http.MethodDelete, fmt.Sprintf("/categories/%d", initialCategory.ID), nil)
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

		// 後処理: もしカテゴリが削除されていない場合には削除する
		db.Unscoped().Delete(&initialCategory)
	})
}
