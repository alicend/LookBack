package models

import (
	"time"
	"testing"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"

	"github.com/alicend/LookBack/app/constant"
)

func TestCreateGuestUser(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// ゲストユーザーと関連するカテゴリ、タスク、ユーザーグループを削除
	DeleteGuestUser(db)

	// CreateGuestUser関数のテスト
	createdUser, err := CreateGuestUser(db)
	assert.Nil(t, err, "CreateGuestUser should not return an error")
	assert.Equal(t, "山田太郎", createdUser.Name, "Created guest user name should match the input")

	// テストデータの検証
	var userCount int64
	db.Model(&User{}).Where("user_group_id = ?", 0).Count(&userCount)
	assert.Equal(t, int64(3), userCount, "There should be 3 guest users")

	var categoryCount int64
	db.Model(&Category{}).Where("user_group_id = ?", 0).Count(&categoryCount)
	assert.Equal(t, int64(2), categoryCount, "There should be 2 categories")

	var taskCount int64
	db.Model(&Task{}).Where("creator = ? OR responsible = ?", createdUser.ID, createdUser.ID).Count(&taskCount)
	assert.Equal(t, int64(5), taskCount, "There should be 1 task related to the created guest user")

	// 作成したデータの後処理（テスト後にデータを削除）
	db.Unscoped().Where("creator = ? OR responsible = ?", createdUser.ID, createdUser.ID).Delete(&Task{})
	db.Unscoped().Where("user_group_id = ?", 0).Delete(&Category{})
	db.Unscoped().Where("user_group_id = ?", 0).Delete(&User{})
	db.Unscoped().Where("id = ?", 0).Delete(&UserGroup{})
}

func TestDeleteGuestUser(t *testing.T) {
	// テスト用のMySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("MySQLデータベースへの接続に失敗しました: %v", err)
	}

	// ゲストユーザーと関連するカテゴリ、タスク、ユーザーグループを作成
	// UserGroup の挿入
	userGroup := UserGroup{UserGroup: "開発部"}
	db.Create(&userGroup)
	// IDを0に更新
	db.Model(&userGroup).Update("ID", 0)

	// Users の挿入
	users := []User{
		{Name: "山田太郎", Password: "password123", Email: "yamada@example.com", UserGroupID: userGroup.ID},
		{Name: "佐藤花子", Password: "password456", Email: "sato@example.com", UserGroupID: userGroup.ID},
		{Name: "鈴木一郎", Password: "password789", Email: "suzuki@example.com", UserGroupID: userGroup.ID},
	}
	db.Create(&users)

	// Categories の挿入
	categories := []Category{
		{Category: "バグ修正", UserGroupID: userGroup.ID},
		{Category: "新機能", UserGroupID: userGroup.ID},
	}
	db.Create(&categories)

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
			Creator:     users[1].ID,
			CategoryID:  categories[1].ID,
			Status:      2,
			Responsible: users[1].ID,
			Estimate:    uintPtr(10),
			StartDate:   timePtr(time.Now().AddDate(0, 1, 0)),
		},
		{
			Task:        "財務監査",
			Description: "最後の四半期の監査",
			Creator:     users[2].ID,
			CategoryID:  categories[1].ID,
			Status:      1,
			Responsible: users[2].ID,
			Estimate:    uintPtr(15),
			StartDate:   timePtr(time.Now().AddDate(0, 0, 7)),
		},
		{
			Task:        "データバックアップ",
			Description: "月末のデータバックアップ",
			Creator:     users[0].ID,
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
			Responsible: users[1].ID,
			Estimate:    uintPtr(5),
			StartDate:   timePtr(time.Now().AddDate(0, 0, -3)),
		},
	}
	db.Create(&tasks)

	// DeleteGuestUser関数を実行
	err = DeleteGuestUser(db)
	assert.Nil(t, err, "DeleteGuestUser should not return an error")

	// user_group_id 0のユーザーが削除されたことを確認
	var userCount int64
	db.Model(&User{}).Where("user_group_id = ?", 0).Count(&userCount)
	assert.Equal(t, int64(0), userCount, "There should be 0 guest users")

	// user_group_id 0のカテゴリが削除されたことを確認
	var categoryCount int64
	db.Model(&Category{}).Where("user_group_id = ?", 0).Count(&categoryCount)
	assert.Equal(t, int64(0), categoryCount, "There should be 0 categories for guest users")

	// 削除されたユーザーに関連するタスクも削除されていることを確認
	userIDs := []uint{}
	for _, user := range users {
		userIDs = append(userIDs, user.ID)
	}
	var taskCount int64
	db.Model(&Task{}).Where("creator IN ? OR responsible IN ?", userIDs, userIDs).Count(&taskCount)
	assert.Equal(t, int64(0), taskCount, "There should be 0 tasks related to the guest users")

	// idが0のUserGroupが削除されていることを確認
	var userGroupCount int64
	db.Model(&UserGroup{}).Where("id = ?", 0).Count(&userGroupCount)
	assert.Equal(t, int64(0), userGroupCount, "There should be 0 UserGroups with id 0")
}