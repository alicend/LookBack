package controllers

import (
	"net/http"
	"errors"
	"log"
	"os"

	"gorm.io/gorm"
	"github.com/gin-gonic/gin"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/utils"
)

func (handler *Handler) SignUpHandler(c *gin.Context) {
	var signUpInput models.UserSignUpInput
	if err := c.ShouldBindJSON(&signUpInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	newUserGroup := &models.UserGroup{
		UserGroup:   signUpInput.UserGroup,
	}

	userGroupID, err := newUserGroup.CreateUserGroup(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	newUser := &models.User{
		Name:        signUpInput.Name,
		Password:    signUpInput.Password,
		Email:       signUpInput.Email,
		UserGroupID: userGroupID,
	}

	user, err := newUser.CreateUser(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id": user.ID,
		"message": "Successfully created user",
	})
}

func (handler *Handler) LoginHandler(c *gin.Context) {
	var loginInput models.UserLoginInput
	if err := c.ShouldBind(&loginInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// ユーザを取得
	user, err := models.FindUserByName(handler.DB, loginInput.Name)
	if errors.Is(err, gorm.ErrRecordNotFound) {
    respondWithErrAndMsg(c, http.StatusNotFound, err.Error(), "存在しないユーザです")
    return
	} else if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	} 

  // 入力されたパスワードとIDから取得したパスワードが等しいかを検証
	if !user.VerifyPassword(loginInput.Password) {
		log.Printf("パスワードが違います")
		respondWithError(c, http.StatusUnauthorized, "パスワードが違います")
		return
	}

	// クッキーにJWT(中身はユーザID)をセットする
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// JWT_TOKEN_NAMEはクライアントで設定した名称
	c.SetCookie(constant.JWT_TOKEN_NAME, token, constant.COOKIE_MAX_AGE, "/", os.Getenv("DOMAIN"), false, true)
	
	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

func (handler *Handler) LogoutHandler(c *gin.Context) {
	// Clear the cookie named "access_token"
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", os.Getenv("DOMAIN"), false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully logged out",
	})
}


// ==================================================================
// 以下はプライベート関数
// ==================================================================

func respondWithError(c *gin.Context, status int, err string) {
	c.JSON(status, gin.H{
		"error": err,
	})
}

func respondWithErrAndMsg(c *gin.Context, status int, err string, msg string) {
	c.JSON(status, gin.H{
		"error"  : err,
		"message": msg,
	})
}