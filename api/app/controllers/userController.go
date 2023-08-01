package controllers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
)

func (handler *Handler) GetUsersAllHandler(c *gin.Context) {

	users, err := models.FindUsersAll(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users" : users,  // usersをレスポンスとして返す
	})
}

func (handler *Handler) GetCurrentUserHandler(c *gin.Context) {

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}

	user, err := models.FindUserByIDWithoutPassword(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user" : user,  // userをレスポンスとして返す
	})
}

func (handler *Handler) DeleteUserHandler(c *gin.Context) {
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully deleted task",
	})
}

func (handler *Handler) UpdateCurrentUserHandler(c *gin.Context) {
	var updateInput models.UserUpdateInput
	if err := c.ShouldBindJSON(&updateInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}

	// ユーザを取得
	user, err := models.FindUserByID(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// 入力されたパスワードとIDから取得したパスワードが等しいかを検証
	if !user.VerifyPassword(updateInput.CurrentPassword) {
		log.Printf("パスワードが違います")
		respondWithError(c, http.StatusUnauthorized, "パスワードが違います")
		return
	}

	updateUser := &models.User{
		Name:     updateInput.NewName,
		Password: updateInput.NewPassword,
	}

	err = updateUser.UpdateUser(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": updateUser,
	})
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
