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

func (handler *Handler) GetUsersAllHandler(c *gin.Context) {

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}

	users, err := models.FindUsersAll(handler.DB, userID)
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
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully deleted task",
	})
}

func (handler *Handler) SendEmailUpdateEmailHandler(c *gin.Context) {
	var emailUpdateInput models.EmailUpdateInput
	if err := c.ShouldBindJSON(&emailUpdateInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// メールアドレスが既に使用されていないか確認
	_, err := models.FindUserByEmail(handler.DB, emailUpdateInput.NewEmail)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			respondWithError(c, http.StatusBadRequest, err.Error())
			return
	} else if err == nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, "", "他のユーザーが使用しているので別のメールアドレスを入力してください")
		return
	}

	err = sendUpdateEmailMailFromGmail(emailUpdateInput.NewEmail);
	if err != nil {
		respondWithErrAndMsg(c, http.StatusInternalServerError, err.Error(), "メールの送信に失敗しました")
		return
	}

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

func (handler *Handler) UpdateCurrentUserEmailHandler(c *gin.Context) {
	var emailUpdateInput models.EmailUpdateInput
	if err := c.ShouldBindJSON(&emailUpdateInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// メールアドレスが既に使用されていないか確認
	_, err := models.FindUserByEmail(handler.DB, emailUpdateInput.NewEmail)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			respondWithError(c, http.StatusBadRequest, err.Error())
			return
	} else if err == nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, "", "他のユーザーが使用しているので別のメールアドレスを入力してください")
		return
	}

	updateUser := &models.User{
		Email:     emailUpdateInput.NewEmail,
	}

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}

	err = updateUser.UpdateEmail(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	updatedUser, err := models.FindUserByIDWithoutPassword(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user" : updatedUser,  // userをレスポンスとして返す
	})
}

func (handler *Handler) UpdateCurrentUsernameHandler(c *gin.Context) {
	var usernameUpdateInput models.UsernameUpdateInput
	if err := c.ShouldBindJSON(&usernameUpdateInput); err != nil {
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

	user, err := models.FindUserByIDWithoutPassword(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// ユーザ名が既に使用されていないか確認
	_, err = models.FindUserByNameAndUserGroup(handler.DB, usernameUpdateInput.NewName, user.UserGroupID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			respondWithError(c, http.StatusBadRequest, err.Error())
			return
	} else if err == nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, "", "別のユーザーが使用しているので別の名前を入力してください")
		return
	}

	updateUser := &models.User{
		Name:     usernameUpdateInput.NewName,
	}

	err = updateUser.UpdateUsername(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	updatedUser, err := models.FindUserByIDWithoutPassword(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user" : updatedUser,  // userをレスポンスとして返す
	})
}

func (handler *Handler) UpdateCurrentUserPasswordHandler(c *gin.Context) {
	var userPasswordUpdateInput models.UserPasswordUpdateInput
	if err := c.ShouldBindJSON(&userPasswordUpdateInput); err != nil {
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
	if !user.VerifyPassword(userPasswordUpdateInput.CurrentPassword) {
		log.Printf("パスワードが違います")
		respondWithError(c, http.StatusBadRequest, "パスワードが違います")
		return
	}

	updateUser := &models.User{
		Password: userPasswordUpdateInput.NewPassword,
	}

	err = updateUser.UpdateUserPassword(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	updatedUser, err := models.FindUserByIDWithoutPassword(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user" : updatedUser,  // userをレスポンスとして返す
	})
}

func (handler *Handler) UpdateCurrentUserGroupHandler(c *gin.Context) {
	var userGroupUpdateInput models.UserGroupUpdateInput
	if err := c.ShouldBindJSON(&userGroupUpdateInput); err != nil {
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

	updateUser := &models.User{
		UserGroupID: userGroupUpdateInput.NewUserGroupID,
	}

	err = updateUser.UpdateUserGroup(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	updatedUser, err := models.FindUserByIDWithoutPassword(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user" : updatedUser,  // userをレスポンスとして返す
	})
}

func (handler *Handler) DeleteCurrentUserHandler(c *gin.Context) {

	deleteUser := &models.User{}

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}

	err = deleteUser.DeleteUserAndRelatedTasks(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Clear the cookie named "access_token"
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)
	
	c.JSON(http.StatusOK, gin.H{})
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================

func sendUpdateEmailMailFromGmail(email string) error {
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
	registrationURL := fmt.Sprintf("%s/update/email?&email=%s", os.Getenv("FRONTEND_ORIGIN"), emailToken)

	// メールの受信者と本文
	to := []string{email}
	subject := "【Look Back Calendar】メールアドレス更新のお願い"
	body := fmt.Sprintf("メールアドレスの更新を完了するには、以下のリンクにアクセスしてください。\n%s", registrationURL)

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
