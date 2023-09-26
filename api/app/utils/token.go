package utils

import (
	"fmt"
	"os"
	"strconv"
	"time"
	"log"

	"github.com/golang-jwt/jwt/v5"

	"github.com/alicend/LookBack/app/constant"
)

func GenerateSessionToken(userId uint) (string, error) {
	secretKey := os.Getenv("SESSION_SECRET_KEY") // 暗号化、復号化するためのキー
	tokenLifeTime, err := strconv.Atoi(constant.JWT_TOKEN_LIFETIME)
	if err != nil {
		return "", err
	}

	claims := jwt.MapClaims{
		"user_id": userId,
		"exp":     time.Now().Add(time.Hour * time.Duration(tokenLifeTime)).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func GenerateEmailToken(email string) (string, error) {
	secretKey := os.Getenv("EMAIL_SECRET_KEY") // 暗号化、復号化するためのキー
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"email": email,
			"exp":  time.Now().Add(time.Hour * 1).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secretKey))
	return tokenString, err
}

func GenerateUserGroupIDToken(userGroupID uint) (string, error) {
	secretKey := os.Getenv("USER_GROUP_ID_SECRET_KEY") // 暗号化、復号化するためのキー
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_group_id": userGroupID,
			"exp":  time.Now().Add(time.Hour * 1).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secretKey))
	return tokenString, err
}

func ParseSessionToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SESSION_SECRET_KEY")), nil
	})
	if err != nil {
		return nil, err
	}

	log.Println(token)
	return token, nil
}