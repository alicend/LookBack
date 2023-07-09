package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/utils"
)

func (handler *Handler) SignUpHandler(c *gin.Context) {
	var signUpInput models.UserInput
	if err := c.ShouldBindJSON(&signUpInput); err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}

	newUser := &models.User{
		Name:     signUpInput.Name,
		Password: signUpInput.Password,
	}

	user, err := newUser.CreateUser(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to create user")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id": user.ID,
		"message": "Successfully created user",
	})
}

func (handler *Handler) LoginHandler(c *gin.Context) {
	var loginInput models.UserInput
	if err := c.ShouldBind(&loginInput); err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}

	// メールアドレスでユーザを取得
	user, err := models.FindUserByName(handler.DB, loginInput.Name)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Failed to find user")
		return
	}

  // 入力されたパスワードとIDから取得したパスワードが等しいかを検証
	if !user.VerifyPassword(loginInput.Password) {
		respondWithError(c, http.StatusUnauthorized, "Password is invalid")
		return
	}

	// クッキーにJWT(中身はユーザID)をセットする
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to sign up")
		return
	}

	// JWT_TOKEN_NAMEはクライアントで設定した名称
	c.SetCookie(constant.JWT_TOKEN_NAME, token, constant.COOKIE_MAX_AGE, "/", "localhost", false, true)
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully logged in",
	})
}

func (handler *Handler) LogoutHandler(c *gin.Context) {
	// Clear the cookie named "access_token"
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", "localhost", false, true)

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