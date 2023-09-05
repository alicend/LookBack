package controllers

import (
	"net/http"
	"errors"
	"fmt"
	"log"
	"os"

	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
	"github.com/resendlabs/resend-go"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/utils"
)

type UserPreSignUpInput struct {
	Email string `json:"email" binding:"required,email"`
}

func (handler *Handler) SendSignUpEmailHandler(c *gin.Context) {

	var userPreSignUpInput UserPreSignUpInput
	if err := c.ShouldBindJSON(&userPreSignUpInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// メールアドレスが既に使用されていないか確認
	_, err := models.FindUserByEmail(handler.DB, userPreSignUpInput.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			respondWithError(c, http.StatusBadRequest, err.Error())
			return
	} else if err == nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, "", "他のユーザーが使用しているので別のメールアドレスを入力してください")
		return
	}

	err = sendSignUpMail(userPreSignUpInput.Email);
	if err != nil {
		respondWithErrAndMsg(c, http.StatusInternalServerError, err.Error(), "メールの送信に失敗しました")
		return
	}

	// 生成したトークンをJSONレスポンスとして返す
	c.JSON(http.StatusOK, gin.H{})
}

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
	user, err := models.FindUserByEmail(handler.DB, loginInput.Email)
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
	token, err := utils.GenerateSessionToken(user.ID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// JWTでセッション管理する
	c.SetCookie(constant.JWT_TOKEN_NAME, token, constant.COOKIE_MAX_AGE, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)
	
	// ゲストログインでないことをクッキーに登録
	c.SetCookie(constant.GUEST_LOGIN, "false", constant.COOKIE_MAX_AGE, "/", os.Getenv("FRONTEND_DOMAIN"), false, false)

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

func (handler *Handler) GuestLoginHandler(c *gin.Context) {	
	// ゲストユーザーと関連するカテゴリ、タスク、ユーザーグループを削除
	err := models.DeleteGuestUser(handler.DB)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusInternalServerError, err.Error(), "ゲストログインに失敗しました")
		return
	}

	// ゲストユーザーと関連するカテゴリ、タスク、ユーザーグループを作成
	user, err := models.CreateGuestUser(handler.DB)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusInternalServerError, err.Error(), "ゲストログインに失敗しました")
		return
	}

	// クッキーにJWT(中身はユーザID)をセットする
	token, err := utils.GenerateSessionToken(user.ID)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusInternalServerError, err.Error(), "ゲストログインに失敗しました")
		return
	}

	// JWTでセッション管理する
	c.SetCookie(constant.JWT_TOKEN_NAME, token, constant.COOKIE_MAX_AGE, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)

	// ゲストログインであることをクッキーに登録
	c.SetCookie(constant.GUEST_LOGIN, "true", constant.COOKIE_MAX_AGE, "/", os.Getenv("FRONTEND_DOMAIN"), false, false)
	
	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

func (handler *Handler) LogoutHandler(c *gin.Context) {
	// クッキーの値を削除
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)
	c.SetCookie(constant.GUEST_LOGIN, "", -1, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)

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

func sendSignUpMail(email string) error {

  client := resend.NewClient(os.Getenv("RESEND_TOKEN"))

	// URLを生成
	// トークンを生成
	emailToken, err := utils.GenerateEmailToken(email)
	if err != nil {
		log.Printf("Token generation failed: %v", err)
		return err
	}
	registrationURL := fmt.Sprintf("%s/sign-up?&email=%s", os.Getenv("FRONTEND_ORIGIN"), emailToken)

	body := fmt.Sprintf(`
		<p>登録を完了するには、以下のリンクにアクセスしてください。</p>
		<a href="%s">%s</a>
	`, registrationURL, registrationURL)

	subject := "【Look Back Calendar】登録のお願い"

    params := &resend.SendEmailRequest{
        From:    "Look Back Calendar <sign-up@lookback-calendar.com>",
        To:      []string{email},
        Html:    body,
        Subject: subject,
    }

    sent, err := client.Emails.Send(params)
    if err != nil {
        log.Println(err.Error())
        return err
    }
    fmt.Println(sent.Id)

	return nil
}