package config

import (
	"fmt"
	"log"
	"os"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func DBConnect() (*gorm.DB, error) {

	// 環境変数の読み込み
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),     // データベースのユーザ名
		os.Getenv("DB_PASSWORD"), // データベースのパスワード
		os.Getenv("DB_HOST"),     // データベースのコンテナ名
		os.Getenv("DB_NAME"),     // データベース名
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	return db, err
}
