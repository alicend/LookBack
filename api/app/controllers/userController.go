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

type PasswordResetInput struct {
	Email string `json:"email" binding:"required,email"`
}

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

	err = handler.MailSender.SendUpdateEmailMail(emailUpdateInput.NewEmail);
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

func (handler *Handler) SendEmailResetPasswordHandler(c *gin.Context) {
	var passwordResetInput PasswordResetInput
	if err := c.ShouldBindJSON(&passwordResetInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// メールアドレスが登録済みか確認
	_, err := models.FindUserByEmail(handler.DB, passwordResetInput.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 未登録の場合
			respondWithErrAndMsg(c, http.StatusBadRequest, "", "入力したメールアドレスは未登録です")
			return
		} else {
			// データベースエラーの場合
			respondWithError(c, http.StatusBadRequest, err.Error())
			return
		}
	}

	// レコードが存在する場合
	err = handler.MailSender.SendUpdatePasswordMail(passwordResetInput.Email)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusInternalServerError, err.Error(), "メールの送信に失敗しました")
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func (handler *Handler) ResetPasswordHandler(c *gin.Context) {
	var userPasswordResetInput models.UserPasswordResetInput
	if err := c.ShouldBindJSON(&userPasswordResetInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	updateUser := &models.User{
		Password: userPasswordResetInput.Password,
		Email:    userPasswordResetInput.Email,
	}

	err := updateUser.ResetUserPassword(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{})
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
		respondWithError(c, http.StatusInternalServerError, err.Error())
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

	// ログインセッションを削除
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)
	
	c.JSON(http.StatusOK, gin.H{})
}

func (p *ProductionMailSender)SendUpdateEmailMail(email string) error {

	client := resend.NewClient(os.Getenv("RESEND_TOKEN"))

	// URLを生成
	// トークンを生成
	emailToken, err := utils.GenerateEmailToken(email)
	if err != nil {
		log.Printf("Token generation failed: %v", err)
		return err
	}
	registrationURL := fmt.Sprintf("%s/update/email?&email=%s", os.Getenv("FRONTEND_ORIGIN"), emailToken)

	body := fmt.Sprintf(`
		<p>メールアドレスの更新を完了するには、以下のリンクにアクセスしてください。</p>
		<a href="%s">%s</a>
	`, registrationURL, registrationURL)

	subject := "【Look Back Calendar】メールアドレス更新のお願い"

    params := &resend.SendEmailRequest{
        From:    "Look Back Calendar <update@lookback-calendar.com>",
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

func (p *ProductionMailSender)SendUpdatePasswordMail(email string) error {

	client := resend.NewClient(os.Getenv("RESEND_TOKEN"))

	// URLを生成
	// トークンを生成
	emailToken, err := utils.GenerateEmailToken(email)
	if err != nil {
		log.Printf("Token generation failed: %v", err)
		return err
	}
	registrationURL := fmt.Sprintf("%s/update/password?&email=%s", os.Getenv("FRONTEND_ORIGIN"), emailToken)

	body := fmt.Sprintf(`
		<p>パスワードの更新を完了するには、以下のリンクにアクセスしてください。</p>
		<a href="%s">%s</a>
	`, registrationURL, registrationURL)

	subject := "【Look Back Calendar】パスワード更新のお願い"

    params := &resend.SendEmailRequest{
        From:    "Look Back Calendar <update@lookback-calendar.com>",
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
