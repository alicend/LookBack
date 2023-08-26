package models

import (
	"time"
	"errors"
	"testing"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"

	"github.com/alicend/LookBack/app/constant"
)

func TestMigrateUserGroup(t *testing.T) {
	// MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// MigrateUserGroup関数をテスト
	userGroup := &UserGroup{}
	err = userGroup.MigrateUserGroup(db)
	assert.Nil(t, err, "MigrateUserGroup should not return an error")

	// UserGroupテーブルが正しく作成されているかを確認
	hasTable := db.Migrator().HasTable(&UserGroup{})
	assert.True(t, hasTable, "UserGroup table should be created")
}

func TestCreateUserGroup(t *testing.T) {
	// MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// ユーザーグループのテストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}

	// CreateUserGroup関数を呼び出す
	err = userGroup.CreateUserGroup(db)
	assert.Nil(t, err)

	// DBから同じ名前のUserGroupが作成されたかを確認
	var fetchedGroup UserGroup
	db.Where("user_group = ?", "TestUserGroup").First(&fetchedGroup)
	assert.Equal(t, "TestUserGroup", fetchedGroup.UserGroup)

	// テストデータの削除
	db.Unscoped().Delete(&userGroup)
}

func TestFetchUserGroups(t *testing.T) {
	// MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// ユーザーグループのテストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	// FetchUserGroups関数を呼び出す
	groups, err := FetchUserGroups(db)
	assert.Nil(t, err)
	assert.NotNil(t, groups)

	// 期待されるUserGroupが含まれているかを確認
	var containsTestGroup bool
	for _, group := range groups {
		if group.UserGroup == "TestUserGroup" {
			containsTestGroup = true
			break
		}
	}
	assert.True(t, containsTestGroup)

	// テストデータの削除
	db.Unscoped().Delete(&userGroup)
}

func TestFetchUserGroupIDByUserID(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestUser",
		Password:    "TestPassword",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	// 正常ケースのテスト
	fetchedID, err := FetchUserGroupIDByUserID(db, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, userGroup.ID, fetchedID)

	// 無効なユーザーIDのケース
	fetchedID, err = FetchUserGroupIDByUserID(db, 9999) // 9999は存在しないユーザーIDと仮定
	assert.Nil(t, err)
	assert.Equal(t, uint(0), fetchedID)

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestUpdateUserGroup(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "InitialGroup",
	}
	db.Create(userGroup)

	// 正常ケースのテスト
	userGroup.UserGroup = "UpdatedGroup"
	err = userGroup.UpdateUserGroup(db, int(userGroup.ID))
	assert.Nil(t, err)

	// 更新が成功したかデータベースから確認
	var updatedUserGroup UserGroup
	db.First(&updatedUserGroup, userGroup.ID)
	assert.Equal(t, "UpdatedGroup", updatedUserGroup.UserGroup)

	// 存在しないuserGroupIDのケース
	nonExistentID := int(userGroup.ID) + 9999 // 仮に存在しないIDとする
	err = userGroup.UpdateUserGroup(db, nonExistentID)
	assert.NotNil(t, err)
	assert.Equal(t, "指定されたユーザーグループは存在しません", err.Error())

	// テストデータの削除
	db.Unscoped().Delete(&userGroup)
}

func TestDeleteUserGroupAndRelatedUsers(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestGroup",
	}
	db.Create(userGroup)

	user1 := &User{
		Name:        "TestUser1",
		Password:    "TestPassword1",
		UserGroupID: userGroup.ID,
	}
	db.Create(user1)

	user2 := &User{
		Name:        "TestUser2",
		Password:    "TestPassword2",
		UserGroupID: userGroup.ID,
	}
	db.Create(user2)

	category := &Category{
		Category:    "TestCategory",
		UserGroupID: userGroup.ID,
	}

	task := &Task{
		Task:         "Sample Task",
		Description:  "This is a test task",
		Creator:      user1.ID,
		CategoryID:   category.ID,
		Status:       1,
		Responsible:  user2.ID,
		Estimate:     ptrToUint(5),
		StartDate:    ptrToTime(time.Now()),
	}
	db.Create(task)

	// 正常ケースのテスト
	err = userGroup.DeleteUserGroupAndRelatedUsers(db, int(userGroup.ID))
	assert.Nil(t, err)

	// ユーザーグループと関連データが削除されたか確認
	var deletedUserGroup UserGroup
	err = db.First(&deletedUserGroup, userGroup.ID).Error
	assert.True(t, errors.Is(err, gorm.ErrRecordNotFound))

	var deletedUser User
	err = db.First(&deletedUser, user1.ID).Error
	assert.True(t, errors.Is(err, gorm.ErrRecordNotFound))

	var deletedCategory Category
	err = db.First(&deletedCategory, category.ID).Error
	assert.True(t, errors.Is(err, gorm.ErrRecordNotFound))

	var deletedTask Task
	err = db.First(&deletedTask, task.ID).Error
	assert.True(t, errors.Is(err, gorm.ErrRecordNotFound))

	// 存在しないUserGroupIDのケース
	err = userGroup.DeleteUserGroupAndRelatedUsers(db, 9999) // 仮に存在しないIDとする
	assert.NotNil(t, err)
}