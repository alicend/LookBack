package controllers

import (
	"net/http"
	"net/smtp"
	"errors"
	"fmt"
	"log"
	"os"

	"gorm.io/gorm"
	"github.com/gin-gonic/gin"

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

	err = sendSignUpMailFromGmail(userPreSignUpInput.Email);
	if err != nil {
		respondWithErrAndMsg(c, http.StatusInternalServerError, err.Error(), "メールの送信に失敗しました")
		return
	}

	// 生成したトークンをJSONレスポンスとして返す
	c.JSON(http.StatusOK, gin.H{
		
	})
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

	// JWT_TOKEN_NAMEはクライアントで設定した名称
	c.SetCookie(constant.JWT_TOKEN_NAME, token, constant.COOKIE_MAX_AGE, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)
	
	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

func (handler *Handler) LogoutHandler(c *gin.Context) {
	// Clear the cookie named "access_token"
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)

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

func sendSignUpMailFromGmail(email string) error {
	// SMTPサーバーの設定
	smtpServer := "smtp.gmail.com"
	port := "587"

	// 認証情報
	from := "lookbackcalendar2023@gmail.com"
	password := os.Getenv("GMAIL_PASSWORD")

	// URLを生成
	// トークンを生成
	emailToken, err := utils.GenerateEmailToken(email)
	if err != nil {
		log.Printf("Token generation failed: %v", err)
		return err
	}
	registrationURL := fmt.Sprintf("%s/sign-up?&email=%s", os.Getenv("FRONTEND_ORIGIN"), emailToken)

	// メールの受信者と本文
	to := []string{email}
	subject := "【Look Back Calendar】登録のお願い"
	body := fmt.Sprintf("登録を完了するには、以下のリンクにアクセスしてください。\n%s", registrationURL)

	// メールヘッダーと本文を結合
	header := make(map[string]string)
	header["From"] = from
	header["To"] = to[0]
	header["Subject"] = subject

	message := ""
	for k, v := range header {
		message += k + ": " + v + "\r\n"
	}
	message += "\r\n" + body

	// 認証
	auth := smtp.PlainAuth("", from, password, smtpServer)

	// メール送信
	err = smtp.SendMail(smtpServer+":"+port, auth, from, to, []byte(message))
	if err != nil {
		log.Fatal("Failed to send the email:", err)
		return err
	}

	return nil
}