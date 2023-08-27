package models

import (
	"testing"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"

	"github.com/alicend/LookBack/app/constant"
)

func TestMigrateUser(t *testing.T) {
	// MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// MigrateUser関数をテスト
	user := &User{}
	err = user.MigrateUser(db)
	assert.Nil(t, err, "MigrateUser should not return an error")

	// Userテーブルが正しく作成されているかを確認
	hasTable := db.Migrator().HasTable(&User{})
	assert.True(t, hasTable, "User table should be created")
}

func TestCreateUser(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// ユーザーグループのテストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	// 正常なユーザー作成
	user := &User{
		Name:        "TestUser",
		Password:    "TestPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	createdUser, err := user.CreateUser(db)
	assert.Nil(t, err, "CreateUser should not return an error")
	assert.Equal(t, "TestUser", createdUser.Name, "Created user name should match the input")

	// 既存のメールアドレスでのユーザー作成
	user2 := &User{
		Name:        "AnotherTestUser",
		Password:    "AnotherPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	_, err = user2.CreateUser(db)
	assert.NotNil(t, err, "CreateUser should return an error when using an existing username")

	// テストデータの削除
	db.Unscoped().Delete(&createdUser)
	db.Unscoped().Delete(&userGroup)
}

func TestFindUserByIDWithoutPassword(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestUser",
		Password:    "TestPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(&user)

	// FindUserByIDWithoutPasswordテスト
	fetchedUser, err := FindUserByIDWithoutPassword(db, user.ID)
	assert.Nil(t, err)  // エラーがnilであることを確認
	assert.Equal(t, user.ID, fetchedUser.ID)  // IDが一致することを確認
	assert.Equal(t, user.Name, fetchedUser.Name)  // 名前が一致することを確認

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestFindUserByID(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// Userテーブルのマイグレーション
	db.AutoMigrate(&User{})

	// ユーザーグループのテストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	// テスト用ユーザーの作成
	user := &User{
		Name:        "TestUser",
		Password:    "TestPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	// FindUserByIDテスト
	fetchedUser, err := FindUserByID(db, user.ID)
	assert.Nil(t, err)  // エラーがnilであることを確認
	assert.Equal(t, user.ID, fetchedUser.ID)  // IDが一致することを確認
	assert.Equal(t, user.Name, fetchedUser.Name)  // 名前が一致することを確認
	assert.Equal(t, user.Password, fetchedUser.Password)  // パスワードもチェック

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestFindUserByEmail(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestUser",
		Password:    "TestPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	fetchedUser, err := FindUserByEmail(db, "test@example.com")
	assert.Nil(t, err)
	assert.Equal(t, user.Name, fetchedUser.Name)

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestFindUserByNameAndUserGroup(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestUser",
		Password:    "TestPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	// FindUserByNameAndUserGroup関数をテスト
	fetchedUser, err := FindUserByNameAndUserGroup(db, "TestUser", userGroup.ID)
	assert.Nil(t, err, "FindUserByNameAndUserGroup should not return an error")
	assert.Equal(t, user.Name, fetchedUser.Name, "Fetched user name should match")
	assert.Equal(t, user.UserGroupID, fetchedUser.UserGroupID, "Fetched user group ID should match")

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}


func TestFindUsersAll(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user1 := &User{
		Name:        "TestUser1",
		Password:    "TestPassword",
		Email:       "test1@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user1)

	user2 := &User{
		Name:        "TestUser2",
		Password:    "TestPassword",
		Email:       "test2@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user2)

	users, err := FindUsersAll(db, user1.ID)
	assert.Nil(t, err)
	assert.Len(t, users, 2)
	assert.Equal(t, "TestUser1", users[0].Name)
	assert.Equal(t, "TestUser2", users[1].Name)

	// テストデータの削除
	db.Unscoped().Delete(&user1)
	db.Unscoped().Delete(&user2)
	db.Unscoped().Delete(&userGroup)
}

func TestUpdateEmail(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestOldUser",
		Password:    "TestPassword",
		Email:       "testOld@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	newUser := &User{
		Email: "testNew@example.com",
	}

	// メールアドレスを変更
	err = newUser.UpdateEmail(db, user.ID)
	assert.Nil(t, err)

	// 更新されたユーザー情報を確認
	var updatedUser User
	db.Where("id = ?", user.ID).First(&updatedUser)
	assert.Equal(t, "testNew@example.com", updatedUser.Email)

	// 既に存在するメールアドレスで更新を試みる
	existingUser := &User{
		Name:        "TestExistingUser",
		Password:    "TestPassword",
		Email:       "testExist@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(existingUser)

	newUser.Email = "testExist@example.com"
	err = newUser.UpdateEmail(db, user.ID)
	assert.NotNil(t, err)

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&existingUser)
	db.Unscoped().Delete(&userGroup)
}

func TestUpdateUsername(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestOldUser",
		Password:    "TestPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	newUser := &User{
		Name: "NewName",
	}

	err = newUser.UpdateUsername(db, user.ID)
	assert.Nil(t, err)

	var updatedUser User
	db.Where("id = ?", user.ID).First(&updatedUser)
	assert.Equal(t, "NewName", updatedUser.Name)

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestUpdateUserPassword(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestUser",
		Password:    "TestOldPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	newUser := &User{
		Password: "NewPassword",
	}

	err = newUser.UpdateUserPassword(db, user.ID)
	assert.Nil(t, err)

	var updatedUser User
	db.Where("id = ?", user.ID).First(&updatedUser)
	assert.Equal(t, "NewPassword", updatedUser.Password)

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestDeleteUserAndRelatedTasks(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	// テストデータ作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestUser",
		Password:    "TestPassword",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(&user)

	if err := user.DeleteUserAndRelatedTasks(db, user.ID); err != nil {
			t.Fatalf("failed to delete user and related tasks: %v", err)
	}

	var count int64
	db.Model(&User{}).Where("id = ?", user.ID).Count(&count)
	if count != 0 {
			t.Errorf("User was not deleted")
	}

	// テストデータの削除
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestVerifyPassword(t *testing.T) {
	user := &User{
			Password: encrypt("password"),
	}

	if !user.VerifyPassword("password") {
			t.Errorf("Password verification failed")
	}

	if user.VerifyPassword("wrong_password") {
			t.Errorf("Password verification should fail for wrong password")
	}
}

