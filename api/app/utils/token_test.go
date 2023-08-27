package utils

import (
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestGenerateToken(t *testing.T) {
	// テストのための環境変数をモック化
	originalSecretKey := os.Getenv("SECRET_KEY")
	os.Setenv("SECRET_KEY", "test_secret_key")
	defer os.Setenv("SECRET_KEY", originalSecretKey)

	userId := uint(1)

	token, err := GenerateToken(userId)
	assert.Nil(t, err, "Error should be nil")

	assert.NotEmpty(t, token, "Token should not be empty")
}

func TestParseToken(t *testing.T) {
	// テストのための環境変数をモック化
	originalSecretKey := os.Getenv("SECRET_KEY")
	os.Setenv("SECRET_KEY", "test_secret_key")
	defer os.Setenv("SECRET_KEY", originalSecretKey)

	userId := uint(1)
	claims := jwt.MapClaims{
		"user_id": userId,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))

	assert.Nil(t, err, "Error should be nil")

	parsedToken, err := ParseToken(tokenString)

	assert.Nil(t, err, "Error should be nil")
	assert.NotNil(t, parsedToken, "Parsed token should not be nil")

	parsedClaims, ok := parsedToken.Claims.(jwt.MapClaims)
	assert.True(t, ok, "Token should have claims")

	assert.Equal(t, userId, uint(parsedClaims["user_id"].(float64)), "User ID should be equal")
}