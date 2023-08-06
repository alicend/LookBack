package models

import (
	"log"
	"fmt"

	"gorm.io/gorm"
)

// カテゴリーテーブル定義 
type UserGroup struct {
	gorm.Model
	UserGroup string `gorm:"size:255;not null" validate:"required,min=1,max=30"`
}

// カテゴリー作成の入力値
type UserGroupInput struct {
	UserGroup string `json:"UserGroup" binding:"required,min=1"`
}

// カテゴリー一覧取得
type UserGroupResponse struct {
	ID       uint
	UserGroup string
}

// TableName メソッドを追加して、この構造体がカテゴリーテーブルに対応することを指定する
func (UserGroupResponse) TableName() string {
	return "categories"
}

func (userGroup *UserGroup) CreateUserGroup(db *gorm.DB) error {
	// 自動マイグレーション(UserGroupテーブルを作成)
	migrateErr := db.AutoMigrate(&UserGroup{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
		return migrateErr
	}

	result := db.Create(userGroup)

	if result.Error != nil {
		log.Printf("Error creating userGroup: %v\n", result.Error)
		return result.Error
	}
	log.Printf("カテゴリーの作成に成功")

	return nil
}

func FetchUserGroup(db *gorm.DB) ([]UserGroupResponse, error) {
	var categories []UserGroupResponse

	result := db.Select("ID", "UserGroup").Order("UserGroup asc").Find(&categories)

	if result.Error != nil {
		log.Printf("Error fetching userGroups: %v", result.Error)
		return nil, result.Error
	}
	log.Printf("カテゴリーの取得に成功")

	return categories, nil
}

func (userGroup *UserGroup) UpdateUserGroup(db *gorm.DB, id int) error {
	result := db.Model(userGroup).Where("id = ?", id).Updates(UserGroup{
		UserGroup: userGroup.UserGroup,
	})

	if result.Error != nil {
		log.Printf("Error updating userGroup: %v\n", result.Error)
		return result.Error
	}
	log.Printf("カテゴリの更新に成功")

	return nil
}

func (userGroup *UserGroup) DeleteUserGroupAndRelatedUsers(db *gorm.DB, id int) error {

	// トランザクションの開始
	tx := db.Begin()

	if tx.Error != nil {
		return tx.Error
	}

	// // 削除するカテゴリに関連するタスクを検索
	// var relatedTasks []Task
	// searchTaskResult := db.Where("category_id = ?", id).Find(&relatedTasks)

	// if searchTaskResult.Error != nil {
	// 	log.Printf("Error finding related tasks: %v\n", searchTaskResult.Error)
	// 	tx.Rollback()
	// 	return searchTaskResult.Error
	// }

	// // 削除するカテゴリに関連するタスクを削除
	// for _, task := range relatedTasks {
	// 	deleteTaskResult := db.Unscoped().Delete(&task)
	// 	if deleteTaskResult.Error != nil {
	// 		log.Printf("Error deleting task: %v\n", deleteTaskResult.Error)
	// 		tx.Rollback()
	// 		return deleteTaskResult.Error
	// 	}
	// }

	// // カテゴリを削除
	// deleteCategoryResult := db.Unscoped().Delete(category, id)

	// if deleteCategoryResult.Error != nil {
	// 	log.Printf("Error deleting category: %v\n", deleteCategoryResult.Error)
	// 	tx.Rollback()
	// 	return deleteCategoryResult.Error
	// }

	// log.Printf("カテゴリーの削除に成功")

	return nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================