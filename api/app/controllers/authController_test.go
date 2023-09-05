package controllers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
	// "github.com/resendlabs/resend-go"
	"github.com/stretchr/testify/assert"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/utils"
)

type UserPreSignUpInput struct {
	Email string `json:"email" binding:"required,email"`
}

func TestSendSignUpEmailHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("should return 400 when invalid JSON is sent", func(t *testing.T) {
		router := gin.Default()
		handler := Handler{} // Initialize or mock your handler here
		router.POST("/signup/request", handler.SendSignUpEmailHandler)

		body := []byte(`{invalid json}`)
		req, _ := http.NewRequest("POST", "/signup/request", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusBadRequest, resp.Code)
	})

	t.Run("should return 400 when email is already taken", func(t *testing.T) {
		router := gin.Default()
		handler := Handler{} // Initialize or mock your handler here

		// Mock the FindUserByEmail function to return a user
		models.FindUserByEmail = func(db *gorm.DB, email string) (*User, error) {
			return &User{}, nil
		}

		router.POST("/signup/request", handler.SendSignUpEmailHandler)

		body := []byte(`{"email": "taken@example.com"}`)
		req, _ := http.NewRequest("POST", "/signup/request", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusBadRequest, resp.Code)
	})

	t.Run("should return 200 when email is not taken", func(t *testing.T) {
		router := gin.Default()
		handler := Handler{} // Initialize or mock your handler here

		// Mock the FindUserByEmail function to return a record not found error
		models.FindUserByEmail = func(db *gorm.DB, email string) (*User, error) {
			return nil, errors.New("record not found")
		}

		router.POST("/signup/request", handler.SendSignUpEmailHandler)

		body := []byte(`{"email": "free@example.com"}`)
		req, _ := http.NewRequest("POST", "/signup/request", bytes.NewBuffer(body))
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})
}

// func (handler *Handler) SignUpHandler(c *gin.Context) {
// 	var signUpInput models.UserSignUpInput
// 	if err := c.ShouldBindJSON(&signUpInput); err != nil {
// 		log.Printf("Invalid request body: %v", err)
// 		log.Printf("リクエスト内容が正しくありません")
// 		respondWithError(c, http.StatusBadRequest, err.Error())
// 		return
// 	}

// 	newUserGroup := &models.UserGroup{
// 		UserGroup:   signUpInput.UserGroup,
// 	}

// 	userGroupID, err := newUserGroup.CreateUserGroup(handler.DB)
// 	if err != nil {
// 		respondWithError(c, http.StatusBadRequest, err.Error())
// 		return
// 	}

// 	newUser := &models.User{
// 		Name:        signUpInput.Name,
// 		Password:    signUpInput.Password,
// 		Email:       signUpInput.Email,
// 		UserGroupID: userGroupID,
// 	}

// 	user, err := newUser.CreateUser(handler.DB)
// 	if err != nil {
// 		respondWithError(c, http.StatusBadRequest, err.Error())
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"user_id": user.ID,
// 		"message": "Successfully created user",
// 	})
// }

// func (handler *Handler) LoginHandler(c *gin.Context) {
// 	var loginInput models.UserLoginInput
// 	if err := c.ShouldBind(&loginInput); err != nil {
// 		log.Printf("Invalid request body: %v", err)
// 		log.Printf("リクエスト内容が正しくありません")
// 		respondWithError(c, http.StatusBadRequest, err.Error())
// 		return
// 	}

// 	// ユーザを取得
// 	user, err := models.FindUserByEmail(handler.DB, loginInput.Email)
// 	if errors.Is(err, gorm.ErrRecordNotFound) {
//     respondWithErrAndMsg(c, http.StatusNotFound, err.Error(), "存在しないユーザです")
//     return
// 	} else if err != nil {
// 		respondWithError(c, http.StatusBadRequest, err.Error())
// 		return
// 	} 

//   // 入力されたパスワードとIDから取得したパスワードが等しいかを検証
// 	if !user.VerifyPassword(loginInput.Password) {
// 		log.Printf("パスワードが違います")
// 		respondWithError(c, http.StatusUnauthorized, "パスワードが違います")
// 		return
// 	}

// 	// クッキーにJWT(中身はユーザID)をセットする
// 	token, err := utils.GenerateSessionToken(user.ID)
// 	if err != nil {
// 		respondWithError(c, http.StatusBadRequest, err.Error())
// 		return
// 	}

// 	// JWT_TOKEN_NAMEはクライアントで設定した名称
// 	c.SetCookie(constant.JWT_TOKEN_NAME, token, constant.COOKIE_MAX_AGE, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)
	
// 	c.JSON(http.StatusOK, gin.H{
// 		"user": user,
// 	})
// }

// func (handler *Handler) LogoutHandler(c *gin.Context) {
// 	// Clear the cookie named "access_token"
// 	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", os.Getenv("FRONTEND_DOMAIN"), false, true)

// 	c.JSON(http.StatusOK, gin.H{
// 		"message": "Successfully logged out",
// 	})
// }


// // ==================================================================
// // 以下はプライベート関数
// // ==================================================================

// func respondWithError(c *gin.Context, status int, err string) {
// 	c.JSON(status, gin.H{
// 		"error": err,
// 	})
// }

// func respondWithErrAndMsg(c *gin.Context, status int, err string, msg string) {
// 	c.JSON(status, gin.H{
// 		"error"  : err,
// 		"message": msg,
// 	})
// }

// func sendSignUpMail(email string) error {

//   client := resend.NewClient(os.Getenv("RESEND_TOKEN"))

// 	// URLを生成
// 	// トークンを生成
// 	emailToken, err := utils.GenerateEmailToken(email)
// 	if err != nil {
// 		log.Printf("Token generation failed: %v", err)
// 		return err
// 	}
// 	registrationURL := fmt.Sprintf("%s/sign-up?&email=%s", os.Getenv("FRONTEND_ORIGIN"), emailToken)

// 	body := fmt.Sprintf(`
// 		<p>登録を完了するには、以下のリンクにアクセスしてください。</p>
// 		<a href="%s">%s</a>
// 	`, registrationURL, registrationURL)

// 	subject := "【Look Back Calendar】登録のお願い"

//     params := &resend.SendEmailRequest{
//         From:    "Look Back Calendar <sign-up@lookback-calendar.com>",
//         To:      []string{email},
//         Html:    body,
//         Subject: subject,
//     }

//     sent, err := client.Emails.Send(params)
//     if err != nil {
//         log.Println(err.Error())
//         return err
//     }
//     fmt.Println(sent.Id)

// 	return nil
// }