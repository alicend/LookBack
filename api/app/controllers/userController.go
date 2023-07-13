package controllers

import (
	"net/http"
	"log"

	"github.com/gin-gonic/gin"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
)

func (handler *Handler) GetUsersAllHandler(c *gin.Context) {

	users, err := models.FindUsersAll(handler.DB)
	if err != nil {
		log.Printf("Failed to fetch users: %v", err)
		log.Printf("ユーザーの取得に失敗しました")
		respondWithError(c, http.StatusBadRequest, "Failed to fetch users")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users" : users,  // usersをレスポンスとして返す
	})
}

func (handler *Handler) DeleteUserHandler(c *gin.Context) {
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully deleted task",
	})
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
