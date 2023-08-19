package config_test

import (
	"testing"
	"net/http"
	"net/http/httptest"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/alicend/LookBack/app/config" 
)

func TestCorsSetting(t *testing.T) {
	r := gin.Default()
	config.CorsSetting(r)

	// テスト用のHTTPリクエストを作成
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatalf("Failed to make a request: %v", err)
	}

	// テスト用のHTTPレスポンスを記録
	w := httptest.NewRecorder()

	// リクエストを処理
	r.ServeHTTP(w, req)

	// CORSヘッダーを確認
	resp := w.Result()
	if resp.Header.Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Errorf("Unexpected Access-Control-Allow-Origin header: %s", resp.Header.Get("Access-Control-Allow-Origin"))
	}
	if resp.Header.Get("Access-Control-Allow-Methods") != "POST, GET, PUT, DELETE, OPTIONS" {
		t.Errorf("Unexpected Access-Control-Allow-Methods header: %s", resp.Header.Get("Access-Control-Allow-Methods"))
	}
	if resp.Header.Get("Access-Control-Allow-Headers") != "Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Content-Type, Content-Length, Accept-Encoding, Authorization" {
		t.Errorf("Unexpected Access-Control-Allow-Headers header: %s", resp.Header.Get("Access-Control-Allow-Headers"))
	}
	if resp.Header.Get("Access-Control-Allow-Credentials") != "true" {
		t.Errorf("Unexpected Access-Control-Allow-Credentials header: %s", resp.Header.Get("Access-Control-Allow-Credentials"))
	}
}
