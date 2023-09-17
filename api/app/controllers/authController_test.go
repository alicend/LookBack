package controllers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
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
			t.Errorf("Error: %v", resp)
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
			t.Errorf("Error: %v", resp)
		}
	})
}
