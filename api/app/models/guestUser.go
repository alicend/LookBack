package models

import (
	"log"
	"time"

	"gorm.io/gorm"
)

func CreateGuestUser(db *gorm.DB) (User, error) {

	tx := db.Begin()
	if tx.Error != nil {
		tx.Rollback()
		log.Printf("Error starting transaction: %v\n", tx.Error)
		return User{}, tx.Error
	}
	
	// UserGroup の挿入
	userGroup := UserGroup{UserGroup: "開発部"}
	if err := tx.Create(&userGroup).Error; err != nil {
		tx.Rollback()
		log.Printf("Error creating userGroup: %v\n", err)
		return User{}, err
	}

	// IDを0に更新
	if err := tx.Model(&userGroup).Update("ID", 0).Error; err != nil {
		tx.Rollback()
		log.Printf("Error updating userGroup ID: %v\n", err)
		return User{}, err
	}

	// Users の挿入
	users := []User{
		{Name: "山田太郎", Password: "password123", Email: "yamada@example.com", UserGroupID: userGroup.ID},
		{Name: "佐藤花子", Password: "password456", Email: "sato@example.com", UserGroupID: userGroup.ID},
		{Name: "鈴木一郎", Password: "password789", Email: "suzuki@example.com", UserGroupID: userGroup.ID},
	}
	if err := tx.Create(&users).Error; err != nil {
		tx.Rollback()
		log.Printf("Error creating users: %v\n", err)
		return User{}, err
	}

	// Categories の挿入
	categories := []Category{
		{Category: "バグ修正", UserGroupID: userGroup.ID},
		{Category: "新機能", UserGroupID: userGroup.ID},
	}
	if err := tx.Create(&categories).Error; err != nil {
		tx.Rollback()
		log.Printf("Error creating categories: %v\n", err)
		return User{}, err
	}

	// Tasks の挿入
	tasks := []Task{
		{
			Task:        "認証問題の修正",
			Description: "アップデート後にログインできない",
			Creator:     users[0].ID,
			CategoryID:  categories[0].ID,
			Status:      1,
			Responsible: users[0].ID,
			Estimate:    uintPtr(3),
			StartDate:   timePtr(time.Now().AddDate(0, 0, 1)),
		},
		{
			Task:        "新しいマーケティングキャンペーンの立ち上げ",
			Description: "夏のセール向けマーケティング",
			Creator:     users[0].ID,
			CategoryID:  categories[1].ID,
			Status:      2,
			Responsible: users[1].ID,
			Estimate:    uintPtr(10),
			StartDate:   timePtr(time.Now().AddDate(0, 1, 0)),
		},
		{
			Task:        "財務監査",
			Description: "最後の四半期の監査",
			Creator:     users[0].ID,
			CategoryID:  categories[1].ID,
			Status:      1,
			Responsible: users[2].ID,
			Estimate:    uintPtr(15),
			StartDate:   timePtr(time.Now().AddDate(0, 0, 7)),
		},
		{
			Task:        "データバックアップ",
			Description: "月末のデータバックアップ",
			Creator:     users[2].ID,
			CategoryID:  categories[0].ID,
			Status:      4,
			Responsible: users[0].ID,
			Estimate:    uintPtr(2),
			StartDate:   timePtr(time.Now()),
		},
		{
			Task:        "UI改善",
			Description: "ユーザーフレンドリーなインターフェースにする",
			Creator:     users[1].ID,
			CategoryID:  categories[1].ID,
			Status:      4,
			Responsible: users[0].ID,
			Estimate:    uintPtr(5),
			StartDate:   timePtr(time.Now().AddDate(0, 0, -3)),
		},
	}
	if err := tx.Create(&tasks).Error; err != nil {
		tx.Rollback()
		log.Printf("Error creating tasks: %v\n", err)
		return User{}, err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.Printf("Error committing transaction: %v\n", err)
		return User{}, err
	}

	log.Printf("ゲストユーザーの作成に成功")

	return users[0], nil
}

func DeleteGuestUser(db *gorm.DB) error {
	tx := db.Begin()
	if tx.Error != nil {
		tx.Rollback()
		log.Printf("Error starting transaction: %v\n", tx.Error)
		return tx.Error
	}
	
	// UserGroupIDが0であるUserのIDを取得
	var userIds []uint
	if err := tx.Model(&User{}).Where("user_group_id = ?", 0).Pluck("id", &userIds).Error; err != nil {
		tx.Rollback()
		log.Printf("Error fetching users: %v\n", err)
		return err
	}
	
	// 取得したUser IDsに紐づくTaskを削除
	if err := tx.Unscoped().Where("creator IN ? OR responsible IN ?", userIds, userIds).Delete(&Task{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting tasks linked to users: %v\n", err)
		return err
	}

	// UserGroupIDが0であるCategoryを削除
	if err := tx.Unscoped().Where("user_group_id = ?", 0).Delete(&Category{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting categories: %v\n", err)
		return err
	}

	// UserGroupIDが0であるUserを削除
	if err := tx.Unscoped().Where("user_group_id = ?", 0).Delete(&User{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting users: %v\n", err)
		return err
	}

	// 最後にIDが0であるUserGroupを削除
	if err := tx.Unscoped().Where("id = ?", 0).Delete(&UserGroup{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting userGroup: %v\n", err)
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}

	log.Printf("ゲストユーザーの削除に成功")

	return nil
}

func uintPtr(u uint) *uint {
	return &u
}

func timePtr(t time.Time) *time.Time {
	return &t
}