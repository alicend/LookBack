package utils

import (
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestGenerateSessionToken(t *testing.T) {
	// テストのための環境変数をモック化
	originalSecretKey := os.Getenv("SESSION_SECRET_KEY")
	os.Setenv("SESSION_SECRET_KEY", "test_secret_key")
	defer os.Setenv("SESSION_SECRET_KEY", originalSecretKey)

	userId := uint(1)

	token, err := GenerateSessionToken(userId)
	assert.Nil(t, err, "Error should be nil")

	assert.NotEmpty(t, token, "Token should not be empty")
}

func TestGenerateEmailToken(t *testing.T) {
	// テストのための環境変数をモック化
	originalSecretKey := os.Getenv("EMAIL_SECRET_KEY")
	os.Setenv("EMAIL_SECRET_KEY", "test_secret_key")
	defer os.Setenv("EMAIL_SECRET_KEY", originalSecretKey)

	email := "test@example.com"
	tokenString, err := GenerateEmailToken(email)

	assert.Nil(t, err, "Error should be nil")

	parsedToken, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("EMAIL_SECRET_KEY")), nil
	})

	assert.Nil(t, err, "Error should be nil")
	assert.NotNil(t, parsedToken, "Parsed token should not be nil")

	parsedClaims, ok := parsedToken.Claims.(jwt.MapClaims)
	assert.True(t, ok, "Token should have claims")

	assert.Equal(t, email, parsedClaims["email"].(string), "Email should be equal")
}

func TestParseSessionToken(t *testing.T) {
	// テストのための環境変数をモック化
	originalSecretKey := os.Getenv("SESSION_SECRET_KEY")
	os.Setenv("SESSION_SECRET_KEY", "test_secret_key")
	defer os.Setenv("SESSION_SECRET_KEY", originalSecretKey)

	userId := uint(1)
	claims := jwt.MapClaims{
		"user_id": userId,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("SESSION_SECRET_KEY")))

	assert.Nil(t, err, "Error should be nil")

	parsedToken, err := ParseSessionToken(tokenString)

	assert.Nil(t, err, "Error should be nil")
	assert.NotNil(t, parsedToken, "Parsed token should not be nil")

	parsedClaims, ok := parsedToken.Claims.(jwt.MapClaims)
	assert.True(t, ok, "Token should have claims")

	assert.Equal(t, userId, uint(parsedClaims["user_id"].(float64)), "User ID should be equal")
}
