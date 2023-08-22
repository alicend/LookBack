package models

import (
	"log"
	"fmt"

	"gorm.io/gorm"
)

// ユーザーグループテーブル定義 
type UserGroup struct {
	gorm.Model
	UserGroup string `gorm:"size:255;not null" validate:"required,min=1,max=30"`
}

// ユーザーグループ作成の入力値
type UserGroupInput struct {
	UserGroup string `json:"UserGroup" binding:"required,min=1,max=30"`
}

// ユーザーグループ一覧取得
type UserGroupResponse struct {
	ID        uint   `gorm:"column:id"`
	UserGroup string `gorm:"column:user_group"`
}

type UserGroupIDResponse struct {
	ID        uint   `gorm:"column:id"`
}

// TableName メソッドを追加して、この構造体がユーザーグループテーブルに対応することを指定する
func (UserGroupResponse) TableName() string {
	return "user_groups"
}

func (userGroup *UserGroup) MigrateUserGroup(db *gorm.DB) error {
	// 自動マイグレーション(UserGroupテーブルを作成)
	migrateErr := db.AutoMigrate(&UserGroup{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
		return migrateErr
	}

	return nil
}

func (userGroup *UserGroup) CreateUserGroup(db *gorm.DB) error {
	// 既存のユーザーグループと重複がないか確認
	var existingUserGroup UserGroup
	if err := db.Where("name = ?", userGroup).First(&existingUserGroup).Error; err != gorm.ErrRecordNotFound {
		log.Printf("UserGroup already exists: %s\n", userGroup.UserGroup)
		return fmt.Errorf("そのユーザーグループは登録済みです")
	}

	result := db.Create(userGroup)

	if result.Error != nil {
		log.Printf("Error creating userGroup: %v\n", result.Error)
		return result.Error
	}
	log.Printf("ユーザーグループの作成に成功")

	return nil
}

func FetchUserGroups(db *gorm.DB) ([]UserGroupResponse, error) {
	var userGroups []UserGroupResponse

	result := db.Select("id", "user_group").Order("user_group asc").Find(&userGroups)

	if result.Error != nil {
		log.Printf("Error fetching user_group: %v", result.Error)
		return nil, result.Error
	}
	log.Printf("ユーザーグループの取得に成功")

	return userGroups, nil
}

func FetchUserGroupIDByUserID(db *gorm.DB, userID uint) (uint, error) {
	var userGroup UserGroupIDResponse

	result := db.Table("user_groups").
		Select("user_groups.id").
		Joins("JOIN users on user_groups.id = users.user_group_id").
		Where("users.id = ?", userID).
		Order("user_group asc").
		Find(&userGroup)

	if result.Error != nil {
		log.Printf("Error fetching user_group: %v", result.Error)
		return 0, result.Error
	}
	log.Printf("ユーザーグループの取得に成功")

	return userGroup.ID, nil
}

func (userGroup *UserGroup) UpdateUserGroup(db *gorm.DB, userGroupID int) error {

	// 既存のユーザーグループと重複がないか確認
	var existingUserGroup UserGroup
	if err := db.Where("name = ?", userGroup).First(&existingUserGroup).Error; err != gorm.ErrRecordNotFound {
		log.Printf("UserGroup already exists: %s\n", userGroup.UserGroup)
		return fmt.Errorf("そのユーザーグループは登録済みです")
	}

	result := db.Model(userGroup).Where("id = ?", userGroupID).Updates(UserGroup{
		UserGroup: userGroup.UserGroup,
	})

	if result.Error != nil {
		log.Printf("Error updating userGroup: %v\n", result.Error)
		return result.Error
	}
	log.Printf("ユーザーグループの更新に成功")

	return nil
}

func (userGroup *UserGroup) DeleteUserGroupAndRelatedUsers(db *gorm.DB, userGroupID int) error {

	// トランザクションの開始
	tx := db.Begin()

	if tx.Error != nil {
		return tx.Error
	}

	// 関連するユーザーの取得
	var users []User
	if err := tx.Where("user_group_id = ?", userGroupID).Find(&users).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 関連するユーザーに紐づくタスクの削除
	for _, user := range users {
		if err := tx.Unscoped().Where("creator = ? OR responsible = ?", user.ID, user.ID).Delete(&Task{}).Error; err != nil {
			tx.Rollback()
			return err
		}
		log.Printf("関連するタスクの削除に成功: ユーザーID %d", user.ID)
	}

	// 関連するユーザーの削除
	if err := tx.Unscoped().Where("user_group_id = ?", userGroupID).Delete(&User{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	log.Printf("関連するユーザーの削除に成功")

	// 関連するカテゴリの削除
	if err := tx.Unscoped().Where("user_group_id = ?", userGroupID).Delete(&Category{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	log.Printf("関連するカテゴリの削除に成功")

	// ユーザーグループの削除
	if err := tx.Unscoped().Delete(&UserGroup{}, userGroupID).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}
	log.Printf("ユーザーグループの削除に成功")

	return nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================