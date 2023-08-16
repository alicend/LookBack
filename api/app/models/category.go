package models

import (
	"log"
	"fmt"

	"gorm.io/gorm"
)

// カテゴリーテーブル定義
type Category struct {
	gorm.Model
	Category   string    `gorm:"size:255;not null" validate:"required,min=1,max=31"`
	UserGroupID uint      `gorm:"not null"`
	UserGroup   UserGroup `gorm:"foreignKey:UserGroupID"`
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

func (category *Category) CreateCategory(db *gorm.DB) error {
	// 自動マイグレーション(Categoryテーブルを作成)
	migrateErr := db.AutoMigrate(&Category{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
		return migrateErr
	}

	result := db.Create(category)

	if result.Error != nil {
		log.Printf("Error creating category: %v\n", result.Error)
		return result.Error
	}
	log.Printf("カテゴリーの作成に成功")

	return nil
}

func FetchCategory(db *gorm.DB, userID uint) ([]CategoryResponse, error) {
	userGroupID, err := FetchUserGroupIDByUserID(db, userID)
	if err != nil {
		return nil, err
	}

	var categories []CategoryResponse

	result := db.
		Select("ID", "Category").
		Where("user_group_id = ?", userGroupID).
		Order("Category asc").
		Find(&categories)

	if result.Error != nil {
		log.Printf("Error fetching categories: %v", result.Error)
		return nil, result.Error
	}
	log.Printf("カテゴリーの取得に成功")

	return categories, nil
}

func (category *Category) UpdateCategory(db *gorm.DB, id int) error {
	result := db.Model(category).Where("id = ?", id).Updates(Category{
		Category: category.Category,
	})

	if result.Error != nil {
		log.Printf("Error updating category: %v\n", result.Error)
		return result.Error
	}
	log.Printf("カテゴリの更新に成功")

	return nil
}

func (category *Category) DeleteCategoryAndRelatedTasks(db *gorm.DB, id int) error {

	// トランザクションの開始
	tx := db.Begin()

	if tx.Error != nil {
		return tx.Error
	}

	// 削除するカテゴリに関連するタスクを検索
	var relatedTasks []Task
	searchTaskResult := db.Where("category_id = ?", id).Find(&relatedTasks)

	if searchTaskResult.Error != nil {
		log.Printf("Error finding related tasks: %v\n", searchTaskResult.Error)
		tx.Rollback()
		return searchTaskResult.Error
	}

	// 削除するカテゴリに関連するタスクを削除
	for _, task := range relatedTasks {
		deleteTaskResult := db.Unscoped().Delete(&task)
		if deleteTaskResult.Error != nil {
			log.Printf("Error deleting task: %v\n", deleteTaskResult.Error)
			tx.Rollback()
			return deleteTaskResult.Error
		}
	}

	// カテゴリを削除
	deleteCategoryResult := db.Unscoped().Delete(category, id)

	if deleteCategoryResult.Error != nil {
		log.Printf("Error deleting category: %v\n", deleteCategoryResult.Error)
		tx.Rollback()
		return deleteCategoryResult.Error
	}

	log.Printf("カテゴリーの削除に成功")

	return nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================