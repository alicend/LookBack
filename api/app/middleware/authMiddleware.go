package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/utils"
)

func AuthMiddleware(c *gin.Context) {
	// トークンが含まれているか確認
	tokenString, err := c.Cookie(constant.JWT_TOKEN_NAME)
	if err != nil {
		log.Printf("Error retrieving cookie: %v", err)
		log.Printf("認証情報が存在しません")
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		c.Abort()
		return
	}

	// 正しいトークンか確認
	_, err = utils.ParseSessionToken(tokenString)
	if err != nil {
		log.Printf("Error parsing token: %v", err)
		log.Printf("認証情報が正しくありません")
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid token",
		})
		c.Abort()
		return
	}

	c.Next()
}