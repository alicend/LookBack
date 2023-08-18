package models

import (
	"log"
	"fmt"

	"gorm.io/gorm"
)

// カテゴリーテーブル定義
type Category struct {
	gorm.Model
	Category   string    `gorm:"size:255;not null" validate:"required,min=1,max=30"`
	UserGroupID uint      `gorm:"not null"`
	UserGroup   UserGroup `gorm:"foreignKey:UserGroupID"`
}

// カテゴリー作成の入力値
type CategoryInput struct {
	Category string `json:"category" binding:"required,min=1,max=30""`
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

	// 既存のカテゴリと重複がないか確認
	var existingCategory Category
	if err := db.Where("category = ? AND user_group_id = ?", category.Category, category.UserGroupID).First(&existingCategory).Error; err != gorm.ErrRecordNotFound {
		log.Printf("Category with name %s already exists in user group %d", category.Category, category.UserGroupID)
		return fmt.Errorf("入力したカテゴリ名は登録済みです")
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

func (category *Category) UpdateCategory(db *gorm.DB, categoryID int) error {

	// 既存のユーザー情報を取得
	var existingCategory Category
	if err := db.Where("id = ?", categoryID).First(&existingCategory).Error; err != nil {
		log.Printf("Error fetching user with ID %d: %v\n", categoryID, err)
		return fmt.Errorf("カテゴリーが見つかりません")
	}

	// 既存のカテゴリと重複がないか確認（更新対象でないカテゴリのみを確認）
	var duplicateCategory Category
	if err := db.Where("category = ? AND user_group_id = ? AND id <> ?", category.Category, existingCategory.UserGroupID, categoryID).First(&duplicateCategory).Error; err != gorm.ErrRecordNotFound {
		log.Printf("Category with name %s already exists in user group %d", category.Category, existingCategory.UserGroupID)
		return fmt.Errorf("入力したカテゴリー名は登録済みです")
	}

	result := db.Model(category).Where("id = ?", categoryID).Updates(Category{
		Category: category.Category,
	})

	if result.Error != nil {
		log.Printf("Error updating category: %v\n", result.Error)
		return result.Error
	}
	log.Printf("カテゴリーの更新に成功")

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
	log.Printf("関連するタスクの削除に成功")

	// カテゴリを削除
	deleteCategoryResult := db.Unscoped().Delete(category, id)

	if deleteCategoryResult.Error != nil {
		log.Printf("Error deleting category: %v\n", deleteCategoryResult.Error)
		tx.Rollback()
		return deleteCategoryResult.Error
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}

	log.Printf("カテゴリーの削除に成功")

	return nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================