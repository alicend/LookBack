package config

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCorsSetting(t *testing.T) {
	r := gin.Default()
	CorsSetting(r)

	// ダミーのハンドラーを追加して200 OKを返す
	r.OPTIONS("/", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	// CORSヘッダーをチェックするためのテストリクエストを作成します。
	req, err := http.NewRequest("OPTIONS", "/", nil)
	assert.NoError(t, err)
	req.Header.Set("Origin", "http://localhost:3000")
	rec := httptest.NewRecorder()

	// テストリクエストをCORSミドルウェアを通して実行
	r.ServeHTTP(rec, req)

	// レスポンスのCORSヘッダーをチェック
	assert.Equal(t, "http://localhost:3000", rec.Header().Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "POST,GET,PUT,DELETE,OPTIONS", rec.Header().Get("Access-Control-Allow-Methods"))
	assert.Equal(t, "Access-Control-Allow-Credentials,Access-Control-Allow-Headers,Content-Type,Content-Length,Accept-Encoding,Authorization", rec.Header().Get("Access-Control-Allow-Headers"))
	assert.Equal(t, "true", rec.Header().Get("Access-Control-Allow-Credentials"))
	assert.Equal(t, "86400", rec.Header().Get("Access-Control-Max-Age"))

	// HTTPステータスコードをチェック
	assert.Equal(t, http.StatusNoContent, rec.Code)
}
