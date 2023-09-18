package controllers

import (
	"bytes"
	"encoding/json"
	"errors"

	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
)

func (m *MockMailSender) SendSignUpMail(email string) error {
	return m.MockSendSignUpMail(email)
}

func TestSendSignUpEmailHandler(t *testing.T) {
	// SQLMock のセットアップ
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to open sqlmock database: %v", err)
	}
	defer sqlDB.Close()

	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn:                      sqlDB,
		SkipInitializeWithVersion: true,
	}), &gorm.Config{})

	mockMailSender := &MockMailSender{}
	handler := &Handler{
		DB:         gormDB,
		MailSender: mockMailSender,
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/signup", handler.SendSignUpEmailHandler)

	mock.ExpectQuery("SELECT (.+) FROM (.+) WHERE email = ?").
		WithArgs("test@example.com").
		WillReturnError(gorm.ErrRecordNotFound)	

	t.Run("成功", func(t *testing.T) {
		mockMailSender.MockSendSignUpMail = func(email string) error {
			return nil
		}

		user := UserPreSignUpInput{Email: "test@example.com"}
		body, _ := json.Marshal(user)
		req, _ := http.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}
	})

	mock.ExpectQuery("SELECT (.+) FROM (.+) WHERE email = ?").
	WithArgs("test@example.com").
	WillReturnError(gorm.ErrRecordNotFound)

	t.Run("メール送信失敗", func(t *testing.T) {
		mockMailSender.MockSendSignUpMail = func(email string) error {
			return errors.New("mail send error")
		}

		user := UserPreSignUpInput{Email: "test@example.com"}
		body, _ := json.Marshal(user)
		req, _ := http.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusInternalServerError {
			t.Errorf("Expected HTTP 500 Internal Server Error, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}
	})
}

func TestSignUpHandler(t *testing.T) {
	// SQLMock のセットアップ
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to open sqlmock database: %v", err)
	}
	defer sqlDB.Close()

	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn:                      sqlDB,
		SkipInitializeWithVersion: true,
	}), &gorm.Config{})

	mockMailSender := &MockMailSender{}
	handler := &Handler{
		DB:         gormDB,
		MailSender: mockMailSender,
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/signup", handler.SignUpHandler)

	t.Run("成功", func(t *testing.T) {
		mock.ExpectBegin()
		mock.ExpectExec("INSERT INTO `user_groups`").
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), "TestGroup").
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		mock.ExpectQuery("SELECT (.+) FROM (.+) WHERE email = ?").
			WithArgs("test@example.com").
			WillReturnError(gorm.ErrRecordNotFound)

		mock.ExpectBegin()
		mock.ExpectExec("INSERT INTO `users`").
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), "TestUser", sqlmock.AnyArg(), "test@example.com", sqlmock.AnyArg()).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		user := models.UserSignUpInput{
			Name:      "TestUser",
			Password:  "password",
			Email:     "test@example.com",
			UserGroup: "TestGroup",
		}
		body, _ := json.Marshal(user)
		req, _ := http.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}
	})

	t.Run("失敗", func(t *testing.T) {
		mock.ExpectExec("INSERT INTO `user_groups`").
			WithArgs("TestGroup").
			WillReturnError(errors.New("Insert failed"))

		user := models.UserSignUpInput{
			Name:      "TestUser",
			Password:  "password",
			Email:     "test@example.com",
			UserGroup: "TestGroup",
		}
		body, _ := json.Marshal(user)
		req, _ := http.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusBadRequest {
			t.Errorf("Expected HTTP 400 Bad Request, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}
	})
}

func TestLoginHandler(t *testing.T) {

	// SQLMock のセットアップ
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to open sqlmock database: %v", err)
	}
	defer sqlDB.Close()

	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn:                      sqlDB,
		SkipInitializeWithVersion: true,
	}), &gorm.Config{})

	mockMailSender := &MockMailSender{}
	handler := &Handler{
		DB:         gormDB,
		MailSender: mockMailSender,
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/login", handler.LoginHandler)

	// テスト用のユーザーデータ
	user := models.User{
		Model:    gorm.Model{ID: 1},
		Name:     "TestUser",
		Password: models.Encrypt("password"),
		Email:    "test@example.com",
		UserGroupID: 1,
	}

	t.Run("成功", func(t *testing.T) {
		// SQL mock の設定
		rows := sqlmock.NewRows([]string{"id", "email","password"}).
			AddRow(user.ID, user.Email, user.Password)
		mock.ExpectQuery("SELECT (.+) FROM (.+) WHERE email = ?").
			WithArgs(user.Email).
			WillReturnRows(rows)

		// リクエストボディ
		loginInput := models.UserLoginInput{
			Email:    user.Email,
			Password: "password",
		}
		body, _ := json.Marshal(loginInput)
		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}
	})

	t.Run("失敗_存在しないユーザ", func(t *testing.T) {
		mock.ExpectQuery("SELECT (.+) FROM (.+) WHERE email = ?").
			WithArgs("unknown@example.com").
			WillReturnError(gorm.ErrRecordNotFound)

		loginInput := models.UserLoginInput{
			Email:    "unknown@example.com",
			Password: "password",
		}
		body, _ := json.Marshal(loginInput)
		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusNotFound {
			t.Errorf("Expected HTTP 404 Not Found, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}
	})

	t.Run("失敗_パスワード不一致", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "email", "password"}).
			AddRow(user.ID, user.Email, user.Password)
		mock.ExpectQuery("SELECT (.+) FROM (.+) WHERE email = ?").
			WithArgs(user.Email).
			WillReturnRows(rows)

		loginInput := models.UserLoginInput{
			Email:    user.Email,
			Password: "wrongPassword",
		}
		body, _ := json.Marshal(loginInput)
		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusUnauthorized {
			t.Errorf("Expected HTTP 401 Unauthorized, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}
	})
}

func TestGuestLoginHandler(t *testing.T) {
	// SQLMock のセットアップ
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to open sqlmock database: %v", err)
	}
	defer sqlDB.Close()

	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn:                      sqlDB,
		SkipInitializeWithVersion: true,
	}), &gorm.Config{})

	handler := &Handler{
		DB: gormDB,
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/login/guest", handler.GuestLoginHandler)

	// テスト用のゲストユーザーデータ
	// テスト用のユーザーデータ
	// guestUser := models.User{
	// 	Model:    gorm.Model{ID: 1},
	// 	Name:     "TestUser",
	// 	Password: "password",
	// 	Email:    "test@example.com",
	// 	UserGroupID: 1,
	// }

	t.Run("成功", func(t *testing.T) {
		// トランザクション開始
		mock.ExpectBegin()

		// UserGroupIDが0であるUserのIDを取得するクエリ
		rows := sqlmock.NewRows([]string{"id"}).AddRow(1)
		mock.ExpectQuery("SELECT (.+) FROM (.+) WHERE user_group_id = ?").
			WithArgs(0).
			WillReturnRows(rows)
	
		// 取得したUser IDsに紐づくTaskを削除するクエリ
		mock.ExpectExec("DELETE FROM `tasks` WHERE creator IN \\(\\?\\) OR responsible IN \\(\\?\\)").
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1))	
	
		// UserGroupIDが0であるCategoryを削除するクエリ
		mock.ExpectExec("DELETE FROM (.+) WHERE user_group_id = ?").
			WithArgs(0).
			WillReturnResult(sqlmock.NewResult(0, 1))
	
		// UserGroupIDが0であるUserを削除するクエリ
		mock.ExpectExec("DELETE FROM (.+) WHERE user_group_id = ?").
			WithArgs(0).
			WillReturnResult(sqlmock.NewResult(0, 1))
	
		// 最後にIDが0であるUserGroupを削除するクエリ
		mock.ExpectExec("DELETE FROM (.+) WHERE id = ?").
			WithArgs(0).
			WillReturnResult(sqlmock.NewResult(0, 1))
	
		// トランザクションコミット
		mock.ExpectCommit()

		// トランザクションの開始
		mock.ExpectBegin()

		// UserGroup の挿入
		mock.ExpectExec("INSERT INTO `user_groups`").WillReturnResult(sqlmock.NewResult(1, 1))

		// IDを0に更新
		mock.ExpectExec("UPDATE `user_groups` SET").WillReturnResult(sqlmock.NewResult(1, 1))

		// Users の挿入
		mock.ExpectExec("INSERT INTO `users`").WillReturnResult(sqlmock.NewResult(2, 3))

		// Categories の挿入
		mock.ExpectExec("INSERT INTO `categories`").WillReturnResult(sqlmock.NewResult(4, 2))

		// Tasks の挿入
		mock.ExpectExec("INSERT INTO `tasks`").WillReturnResult(sqlmock.NewResult(5, 5))

		// コミット
		mock.ExpectCommit()


		req, _ := http.NewRequest(http.MethodGet, "/login/guest", nil)
		resp := httptest.NewRecorder()

		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
			t.Errorf("Error: %v", resp.Body.String())
		}
	})

}

func TestLogoutHandler(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	handler := &Handler{}
	r.GET("/logout", handler.LogoutHandler)

	// Test case for logout
	t.Run("Successfully logged out", func(t *testing.T) {
		req, err := http.NewRequest(http.MethodGet, "/logout", nil)
		if err != nil {
			t.Fatalf("Failed to make GET request: %v", err)
		}

		resp := httptest.NewRecorder()
		r.ServeHTTP(resp, req)

		if resp.Code != http.StatusOK {
			t.Errorf("Expected HTTP 200 OK, got: %v", resp.Code)
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Errorf("Failed to read response body: %v", err)
		}

		expected := `{"message":"Successfully logged out"}`
		if string(body) != expected {
			t.Errorf("Expected %s, got %s", expected, string(body))
		}

		cookies := resp.Result().Cookies()
		for _, cookie := range cookies {
			if cookie.Name == constant.JWT_TOKEN_NAME || cookie.Name == constant.GUEST_LOGIN {
				if cookie.Value != "" {
					t.Errorf("Expected cookie %s to be empty, got: %s", cookie.Name, cookie.Value)
				}
			}
		}
	})
}
