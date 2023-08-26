package router

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"
)

func TestSetupRouter(t *testing.T) {
	// テスト用のダミーDBを設定
	var dummyDB *gorm.DB = nil // 適切なダミーDBを設定する

	// テスト対象の関数を呼び出す
	router := SetupRouter(dummyDB)

	// テストリクエストを生成
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/auth/logout", nil)

	// テストリクエストをルーターに渡して処理させる
	router.ServeHTTP(w, req)

	// レスポンスコードを確認
	assert.Equal(t, http.StatusOK, w.Code, "Expected status code 200, but got %d", w.Code)
}

