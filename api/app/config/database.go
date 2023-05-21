package database

import (
	"fmt"
	"log"
	// "os"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func DBConnect() *gorm.DB {

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),     // データベースのユーザ名
		os.Getenv("DB_PASSWORD"), // データベースのパスワード
		os.Getenv("DB_HOST"),     // データベースのコンテナ名
		os.Getenv("DB_NAME"),     // データベース名
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("データベースへの接続に失敗しました: %v", err)
	}

	log.Printf("データベースに接続しました: %v", db)
	return db
}
