package controllers

import (
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

func (m *MockMailSender) SendUpdateEmailMail(email string) error {
	return m.MockSendUpdateEmailMail(email)
}
func (m *MockMailSender) SendUpdatePasswordMail(email string) error {
	return m.MockSendUpdatePasswordMail(email)
}

func TestGetUsersAllHandler(t *testing.T) {
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
	r.GET("/users", handler.GetUsersAllHandler)

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

		req, _ := http.NewRequest(http.MethodGet, "/users", nil)
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

			// 応答にusersが含まれていることを確認する
			if _, ok := response["users"]; !ok {
				t.Errorf("Response does not contain users")
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestGetCurrentUserHandler(t *testing.T) {
	// テスト用のデータベース接続を設定
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	handler := &Handler{
		DB: db,
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/current-user", handler.GetCurrentUserHandler)

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
		// テストユーザーのセッショントークンを生成
		tokenString, _ := utils.GenerateSessionToken(user.ID)

		req, _ := http.NewRequest(http.MethodGet, "/current-user", nil)
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

			// レスポンスにuserが含まれていることを確認する
			if _, ok := response["user"]; !ok {
				t.Errorf("Response does not contain user")
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestSendEmailUpdateEmailHandler(t *testing.T) {
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
	r.POST("/email-update", handler.SendEmailUpdateEmailHandler)

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
		// テストユーザーのセッショントークンを生成
		tokenString, _ := utils.GenerateSessionToken(user.ID)

		mockMailSender.MockSendUpdateEmailMail = func(email string) error {
			return nil
		}

		emailUpdateInput := models.EmailUpdateInput{
			NewEmail: "new-email@example.com",
		}

		body, err := json.Marshal(emailUpdateInput)
		if err != nil {
			t.Fatalf("failed to marshal request body: %v", err)
		}

		req, _ := http.NewRequest(http.MethodPost, "/email-update", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})
		req.Header.Set("Content-Type", "application/json")

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

			// レスポンスにuserが含まれていることを確認する
			if _, ok := response["user"]; !ok {
				t.Errorf("Response does not contain user")
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestUpdateCurrentUserEmailHandler(t *testing.T) {
	// テスト用のデータベース接続を設定
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	handler := &Handler{
		DB: db,
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.PUT("/update-email", handler.UpdateCurrentUserEmailHandler)

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
		// テストユーザーのセッショントークンを生成
		tokenString, _ := utils.GenerateSessionToken(user.ID)

		// 新しいメールアドレスのデータを作成
		emailUpdateInput := models.EmailUpdateInput{
			NewEmail: "newemail@example.com",
		}
		requestBody, err := json.Marshal(emailUpdateInput)
		if err != nil {
			t.Fatalf("failed to marshal request body: %v", err)
		}

		req, _ := http.NewRequest(http.MethodPut, "/update-email", bytes.NewBuffer(requestBody))
		resp := httptest.NewRecorder()

		req.Header.Set("Content-Type", "application/json")
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

			// レスポンスに更新されたユーザーが含まれていることを確認する
			updatedUser, ok := response["user"].(map[string]interface{})
			if !ok || updatedUser["Email"] != emailUpdateInput.NewEmail {
				t.Errorf("Response does not contain updated user or email was not updated correctly")
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}


func TestUpdateCurrentUsernameHandler(t *testing.T) {
	// テスト用のデータベース接続を設定
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	handler := &Handler{
		DB:         db,
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.PUT("/update-username", handler.UpdateCurrentUsernameHandler)

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

	// 別のユーザーを作成することで、ユーザー名の重複をテストできるようにします。
	otherUser := &models.User{
		Name:        "Another User",
		Password:    "testPassword123",
		Email:       "another@example.com",
		UserGroupID: userGroup.ID,
	}
	if err := db.Create(&otherUser).Error; err != nil {
		t.Fatalf("failed to create other user: %v", err)
	}

	// テストユーザーのセッショントークンを生成
	tokenString, _ := utils.GenerateSessionToken(user.ID)

	t.Run("成功", func(t *testing.T) {		
		// 新しいユーザー名のデータを作成
		usernameUpdateInput := models.UsernameUpdateInput{
			NewName: "New User",
		}
		requestBody, err := json.Marshal(usernameUpdateInput)
		if err != nil {
			t.Fatalf("failed to marshal request body: %v", err)
		}

		req, _ := http.NewRequest(http.MethodPut, "/update-username", bytes.NewBuffer(requestBody))
		resp := httptest.NewRecorder()

		req.Header.Set("Content-Type", "application/json")
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

			// レスポンスに更新されたユーザーが含まれていることを確認する
			updatedUser, ok := response["user"].(map[string]interface{})
			if !ok || updatedUser["Name"] != usernameUpdateInput.NewName {
				t.Errorf("Response does not contain updated user or name was not updated correctly")
			}
		}
	})

	t.Run("失敗 - 既に使用されているユーザー名", func(t *testing.T) {
		// 新しいユーザー名のデータを作成 (他のユーザーの名前と同じ)
		usernameUpdateInput := models.UsernameUpdateInput{
			NewName: otherUser.Name,
		}
		requestBody, err := json.Marshal(usernameUpdateInput)
		if err != nil {
			t.Fatalf("failed to marshal request body: %v", err)
		}

		req, _ := http.NewRequest(http.MethodPut, "/update-username", bytes.NewBuffer(requestBody))
		resp := httptest.NewRecorder()

		req.Header.Set("Content-Type", "application/json")
		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusBadRequest {
			t.Errorf("Expected HTTP 400 Bad Request, got: %v", resp.Code)
		}
	})

	// 後処理: テスト用のデータを削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&otherUser)
	db.Unscoped().Delete(&userGroup)
}

func TestSendEmailResetPasswordHandler(t *testing.T) {
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
	r.POST("/reset-password", handler.SendEmailResetPasswordHandler)

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
	tokenString, _ := utils.GenerateSessionToken(user.ID)

	t.Run("成功", func(t *testing.T) {
		mockMailSender.MockSendUpdatePasswordMail = func(email string) error {
			return nil
		}

		passwordResetInput := PasswordResetInput{
			Email: "test@example.com",
		}
		requestBody, _ := json.Marshal(passwordResetInput)

		req, _ := http.NewRequest(http.MethodPost, "/reset-password", bytes.NewBuffer(requestBody))
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
		}
	})

	t.Run("失敗 - 存在しないメールアドレス", func(t *testing.T) {
		mockMailSender.MockSendUpdatePasswordMail = func(email string) error {
			return nil
		}

		passwordResetInput := PasswordResetInput{
			Email: "nonexistent@example.com",
		}
		requestBody, _ := json.Marshal(passwordResetInput)

		req, _ := http.NewRequest(http.MethodPost, "/reset-password", bytes.NewBuffer(requestBody))
		resp := httptest.NewRecorder()

		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusBadRequest {
			t.Errorf("Expected HTTP 400 Bad Request, got: %v", resp.Code)
		}
	})

	// 後処理: テスト用のデータを削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestResetPasswordHandler(t *testing.T) {
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
	r.POST("/reset-password", handler.ResetPasswordHandler)

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
			Password:    "oldPassword123",
			Email:       "test@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		passwordResetInput := models.UserPasswordResetInput{
			Email:    "test@example.com",
			Password: "newPassword123",
		}
		requestBody, _ := json.Marshal(passwordResetInput)
		req, _ := http.NewRequest(http.MethodPost, "/reset-password", bytes.NewBuffer(requestBody))
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestUpdateCurrentUserPasswordHandler(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	handler := &Handler{
		DB: db,
	}
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/update-password", handler.UpdateCurrentUserPasswordHandler)

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
			Password:    models.Encrypt("oldPassword123"),
			Email:       "test@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		// テストユーザーのセッショントークンを生成
		tokenString, _ := utils.GenerateSessionToken(user.ID)

		// パスワード更新リクエストを作成
		passwordUpdateInput := models.UserPasswordUpdateInput{
			CurrentPassword: "oldPassword123",
			NewPassword:     "newPassword123",
		}
		requestBody, _ := json.Marshal(passwordUpdateInput)
		req, _ := http.NewRequest(http.MethodPost, "/update-password", bytes.NewBuffer(requestBody))
		req.Header.Set("Content-Type", "application/json")
		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})
		resp := httptest.NewRecorder()

		// リクエストを処理
		router.ServeHTTP(resp, req)

		// 応答を検証
		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		} else {
			var response map[string]interface{}
			err := json.Unmarshal(resp.Body.Bytes(), &response)
			if err != nil {
				t.Errorf("Failed to unmarshal response: %v", err)
			}

			// 応答に'user'が含まれていることを確認する
			if _, ok := response["user"]; !ok {
				t.Errorf("Response does not contain 'user'")
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(&user)
		db.Unscoped().Delete(&userGroup)
	})
}

func TestUpdateCurrentUserGroupHandler(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	handler := &Handler{DB: db}
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/update-user-group", handler.UpdateCurrentUserGroupHandler)

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
			Password:    models.Encrypt("oldPassword123"),
			Email:       "test@example.com",
			UserGroupID: userGroup.ID,
		}
		if err := db.Create(&user).Error; err != nil {
			t.Fatalf("failed to create user: %v", err)
		}

		// テストユーザーのセッショントークンを生成
		tokenString, _ := utils.GenerateSessionToken(user.ID)

		// ユーザーグループ更新リクエストを作成
		userGroupUpdateInput := models.UserGroupUpdateInput{
			NewUserGroupID: userGroup.ID,
		}
		requestBody, _ := json.Marshal(userGroupUpdateInput)
		req, _ := http.NewRequest(http.MethodPost, "/update-user-group", bytes.NewBuffer(requestBody))
		req.Header.Set("Content-Type", "application/json")
		req.AddCookie(&http.Cookie{
			Name:  constant.JWT_TOKEN_NAME,
			Value: tokenString,
		})
		resp := httptest.NewRecorder()

		// リクエストを処理
		router.ServeHTTP(resp, req)

		// 応答を検証
		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		} else {
			var response map[string]interface{}
			err := json.Unmarshal(resp.Body.Bytes(), &response)
			if err != nil {
				t.Errorf("Failed to unmarshal response: %v", err)
			}

			// 応答に'user'が含まれていることを確認する
			if _, ok := response["user"]; !ok {
				t.Errorf("Response does not contain 'user'")
			}
		}

		// 後処理: テスト用のデータを削除
		db.Unscoped().Delete(user)
		db.Unscoped().Delete(userGroup)
	})
}

func TestDeleteCurrentUserHandler(t *testing.T) {
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
    r.DELETE("/user", handler.DeleteCurrentUserHandler)

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

		// テストユーザーのセッショントークンを生成
		tokenString, _ := utils.GenerateSessionToken(user.ID)

        req, _ := http.NewRequest(http.MethodDelete, "/user", nil)
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
        db.Unscoped().Delete(&user)
        db.Unscoped().Delete(&userGroup)
    })
}

