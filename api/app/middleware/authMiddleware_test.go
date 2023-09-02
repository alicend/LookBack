package middleware

import (
	"log"
	"testing"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/utils"
)

func TestAuthMiddleware_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// テスト用の正しいトークンを生成
	validToken, _ := utils.GenerateSessionToken(1)

	router := gin.New()
	router.Use(AuthMiddleware)

	router.GET("/protected", func(c *gin.Context) {
		c.String(http.StatusOK, "Protected endpoint")
	})

	req := httptest.NewRequest("GET", "/protected", nil)
	req.AddCookie(&http.Cookie{
		Name:  constant.JWT_TOKEN_NAME,
		Value: validToken,
	})

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Protected endpoint")
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// テスト用の不正なトークンを生成
	invalidToken := "invalid_token"

	router := gin.New()
	router.Use(AuthMiddleware)

	router.GET("/protected", func(c *gin.Context) {
		c.String(http.StatusOK, "Protected endpoint")
	})

	req := httptest.NewRequest("GET", "/logout", nil)
	req.AddCookie(&http.Cookie{
		Name:  constant.JWT_TOKEN_NAME,
		Value: invalidToken,
	})

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	log.Printf("-------------")
	log.Printf(w.Body.String())
	log.Printf("-------------")
	
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "Invalid token")
}