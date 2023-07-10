package models

import (
	// "time"
	"fmt"

	"gorm.io/gorm"
)

type Category struct {
	gorm.Model
	Category string `gorm:"size:255;not null" validate:"required,min=1,max=31"`
}

type CreateCategoryInput struct {
	Category string `json:"category" binding:"required,min=1,max=31"`
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

// ==================================================================
// 以下はプライベート関数
// ==================================================================