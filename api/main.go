package main

import (
	"log"
	"github.com/alicend/LookBack/app/config"
	"github.com/alicend/LookBack/app/models"
	"github.com/alicend/LookBack/app/router"
)

func main() {
	// DB接続
	db, err := config.DBConnect()
	if err != nil {
		log.Fatalf("データベースへの接続に失敗しました: %v", err)
		return
	} else {
		log.Printf("データベースに接続しました: %v", db)
	}

	// マイグレーションの実行
	err = models.Migrate(db)
	if err != nil {
		log.Fatalf("マイグレーションに失敗しました: %v", err)
	}

	// ルーティング
	r := router.SetupRouter(db)
	r.Run()
}