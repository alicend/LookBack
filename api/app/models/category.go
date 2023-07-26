package models

import (
	// "time"
	"log"
	"fmt"

	"gorm.io/gorm"
)

// カテゴリーテーブル定義 
type Category struct {
	gorm.Model
	Category string `gorm:"size:255;not null" validate:"required,min=1,max=31"`
}

// カテゴリー作成の入力値
type CategoryInput struct {
	Category string `json:"category" binding:"required,min=1"`
}

// カテゴリー一覧取得
type CategoryResponse struct {
	ID       uint
	Category string
}

// TableName メソッドを追加して、この構造体がカテゴリーテーブルに対応することを指定する
func (CategoryResponse) TableName() string {
	return "categories"
}

func (category *Category) CreateCategory(db *gorm.DB) (*CategoryResponse, error) {
	// 自動マイグレーション(Categoryテーブルを作成)
	migrateErr := db.AutoMigrate(&Category{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
		return nil, migrateErr
	}

	result := db.Create(category)

	if result.Error != nil {
		log.Printf("Error creating category: %v\n", result.Error)
		return nil, result.Error
	}
	log.Printf("カテゴリーの作成に成功")

	// CategoryオブジェクトをCategoryResponseオブジェクトに変換
	categoryResponse := &CategoryResponse{
		ID:       category.ID,
		Category: category.Category,
	}

	return categoryResponse, nil
}

func FetchCategory(db *gorm.DB) ([]CategoryResponse, error) {
	var categories []CategoryResponse

	result := db.Select("ID", "Category").Order("Category asc").Find(&categories)

	if result.Error != nil {
		log.Printf("Error fetching categories: %v", result.Error)
		return nil, result.Error
	}
	log.Printf("カテゴリーの取得に成功")

	return categories, nil
}

func (category *Category) UpdateCategory(db *gorm.DB, id int) (*Category, error) {
	result := db.Model(category).Where("id = ?", id).Updates(Category{
		Category: category.Category,
	})

	if result.Error != nil {
		log.Printf("Error updating category: %v\n", result.Error)
		return nil, result.Error
	}
	log.Printf("カテゴリの更新に成功")

	return category, nil
}

func (category *Category) DeleteCategory(db *gorm.DB, id int) error {

	result := db.Unscoped().Delete(category, id)

	if result.Error != nil {
		log.Printf("Error deleting category: %v\n", result.Error)
		return result.Error
	}

	log.Printf("カテゴリーの削除に成功")

	return nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================