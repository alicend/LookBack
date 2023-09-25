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
	// "github.com/alicend/LookBack/app/utils"
)

func TestCreateUserGroupHandler(t *testing.T) {
    // テスト用MySQLデータベースに接続
    db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
    if err != nil {
        t.Fatalf("failed to connect to MySQL database: %v", err)
    }

    handler := &Handler{
        DB: db,
    }

    gin.SetMode(gin.TestMode)
    r := gin.Default()
    r.POST("/user-groups", handler.CreateUserGroupHandler)  // メソッドとエンドポイントを変更

    t.Run("成功", func(t *testing.T) {
        // リクエストボディの作成
        userGroupInput := models.UserGroupInput{
            UserGroup: "Test UserGroup",
        }
        requestBody, err := json.Marshal(userGroupInput)
        if err != nil {
            t.Fatalf("failed to marshal request body: %v", err)
        }

        req, _ := http.NewRequest(http.MethodPost, "/user-groups", bytes.NewBuffer(requestBody))  // メソッドとエンドポイントを変更
        resp := httptest.NewRecorder()

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

            // 応答にuser_groupsが含まれていることを確認する
            if _, ok := response["user_groups"]; !ok {
                t.Errorf("Response does not contain user_groups")
            }
        }

        // 後処理: テスト用のデータを削除
        var userGroup models.UserGroup
        db.Where("user_group = ?", userGroupInput.UserGroup).First(&userGroup)
        db.Unscoped().Delete(&userGroup)
    })
}

func TestGetUserGroupsHandler(t *testing.T) {
    db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
    if err != nil {
        t.Fatalf("failed to connect to MySQL database: %v", err)
    }

    handler := &Handler{
        DB: db,
    }

    gin.SetMode(gin.TestMode)
    r := gin.Default()
    r.GET("/user-groups", handler.GetUserGroupsHandler)

    t.Run("成功", func(t *testing.T) {
        // テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

        req, _ := http.NewRequest(http.MethodGet, "/user-groups", nil)
        resp := httptest.NewRecorder()

        r.ServeHTTP(resp, req)

        if resp.Code != http.StatusOK {
            t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
        }

        // 後処理: テスト用のデータを削除
        db.Unscoped().Delete(&userGroup)
    })
}


func TestUpdateUserGroupHandler(t *testing.T) {
    db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
    if err != nil {
        t.Fatalf("failed to connect to MySQL database: %v", err)
    }

    handler := &Handler{
        DB: db,
    }

    gin.SetMode(gin.TestMode)
    r := gin.Default()
    r.PUT("/user-groups/:id", handler.UpdateUserGroupHandler)

    t.Run("成功", func(t *testing.T) {
        // テストデータの作成
		userGroup := &models.UserGroup{
			UserGroup: "Test UserGroup",
		}
		if err := db.Create(&userGroup).Error; err != nil {
			t.Fatalf("failed to create user group: %v", err)
		}

        updateUserGroupInput := models.UserGroupInput{
            UserGroup: "Updated UserGroup",
        }
        requestBody, _ := json.Marshal(updateUserGroupInput)
        req, _ := http.NewRequest(http.MethodPut, fmt.Sprintf("/user-groups/%d", userGroup.ID), bytes.NewBuffer(requestBody))
        resp := httptest.NewRecorder()

        r.ServeHTTP(resp, req)

        if resp.Code != http.StatusOK {
            t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
        }

        // 後処理: テスト用のデータを削除
        db.Unscoped().Delete(&userGroup)
    })
}


func TestDeleteUserGroupHandler(t *testing.T) {
    db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
    if err != nil {
        t.Fatalf("failed to connect to MySQL database: %v", err)
    }

    handler := &Handler{
        DB: db,
    }

    gin.SetMode(gin.TestMode)
    r := gin.Default()
    r.DELETE("/user-groups/:id", handler.DeleteUserGroupHandler)

    t.Run("成功", func(t *testing.T) {
        // Create test data
        userGroup := &models.UserGroup{
            UserGroup: "Test UserGroup",
        }
        if err := db.Create(&userGroup).Error; err != nil {
            t.Fatalf("failed to create user group: %v", err)
        }

        req, _ := http.NewRequest(http.MethodDelete, fmt.Sprintf("/user-groups/%d", userGroup.ID), nil)
        resp := httptest.NewRecorder()

        r.ServeHTTP(resp, req)

        if resp.Code != http.StatusOK {
            t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
        }
    })

    t.Run("失敗", func(t *testing.T) {
        req, _ := http.NewRequest(http.MethodDelete, "/user-groups/invalid-id", nil)
        resp := httptest.NewRecorder()

        r.ServeHTTP(resp, req)

        if resp.Code != http.StatusBadRequest {
            t.Errorf("Expected HTTP 400 Bad Request, got: %v", resp.Code)
        }
    })
}
