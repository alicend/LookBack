package models

import (
	// "time"
	"fmt"
	"log"

	"gorm.io/gorm"
)

// カテゴリーテーブル定義 
type Category struct {
	gorm.Model
	Category string `gorm:"size:255;not null" validate:"required,min=1,max=31"`
}

// カテゴリー作成の入力値
type CreateCategoryInput struct {
	Category string `json:"category" binding:"required,min=1,max=31"`
}

// カテゴリー一覧取得
type GetCategory struct {
	ID       uint
	Category string
}

// TableName メソッドを追加して、この構造体がカテゴリーテーブルに対応する指定する
func (GetCategory) TableName() string {
	return "categories"
}

func (category *Category) CreateCategory(db *gorm.DB) (*Category, error) {
	// 自動マイグレーション(Categoryテーブルを作成)
	migrateErr := db.AutoMigrate(&Category{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
	}

	result := db.Create(category)

	if result.Error != nil {
		fmt.Printf("Error creating category: %v\n", result.Error)
		fmt.Printf("Category: %+v\n", category)
		return nil, result.Error
	}

	return category, nil
}

func FetchCategory(db *gorm.DB) ([]GetCategory, error) {
	var categories []GetCategory

	result := db.Select("ID", "Category").Order("Category asc").Find(&categories)

	if result.Error != nil {
		log.Printf("Error fetching categories: %v\n", result.Error)
		return nil, result.Error
	}
	log.Printf("カテゴリーの取得に成功")

	return categories, nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================