package models

import (
	"time"
	"testing"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"

	"github.com/alicend/LookBack/app/constant"
)


func TestMigrateCategory(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// MigrateCategoryメソッドをテスト
	category := &Category{}
	err = category.MigrateCategory(db)
	
	assert.Nil(t, err, "MigrateCategory should not return an error")

	// テーブルが実際に作成されたことを確認
	hasTable := db.Migrator().HasTable(&Category{})
	assert.True(t, hasTable, "Category table should be created")
}

func TestCreateCategory(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テーブルのマイグレーション
	db.AutoMigrate(&UserGroup{}, &Category{})

	// テスト用のユーザーグループを作成
	userGroup := UserGroup{
		UserGroup: "TestGroup",
	}
	db.Create(&userGroup)

	// CreateCategoryメソッドをテスト
	category := &Category{
		Category:   "TestCategory",
		UserGroupID: userGroup.ID,
	}
	err = category.CreateCategory(db)
	
	assert.Nil(t, err, "CreateCategory should not return an error for new category")

	// 同じカテゴリ名を持つエントリを再度作成し、エラーを確認
	err = category.CreateCategory(db)
	assert.Error(t, err, "CreateCategory should return an error for duplicate category")

	// データベースにカテゴリが追加されたことを確認
	var createdCategory Category
	db.Where("category = ? AND user_group_id = ?", category.Category, category.UserGroupID).First(&createdCategory)
	assert.Equal(t, "TestCategory", createdCategory.Category, "Category should be added to the database")

	db.Unscoped().Delete(&category)
	db.Unscoped().Delete(&userGroup)
}

func TestFetchCategory(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テーブルのマイグレーション
	db.AutoMigrate(&User{}, &UserGroup{}, &Category{})

	// テストデータの作成
	userGroup := UserGroup{
		UserGroup: "TestGroup",
	}
	db.Create(&userGroup)

	user := &User{
		Name:        "TestUser",
		Password:    "TestPassword123",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	category1 := &Category{
		Category:   "TestCategory1",
		UserGroupID: userGroup.ID,
	}
	db.Create(category1)

	category2 := &Category{
		Category:   "TestCategory2",
		UserGroupID: userGroup.ID,
	}
	db.Create(category2)

	// FetchCategory関数をテスト
	categories, err := FetchCategory(db, user.ID)
	assert.Nil(t, err, "FetchCategory should not return an error")
	assert.Equal(t, 2, len(categories), "FetchCategory should return 2 categories")

	// テストデータが正しく取得されたか確認
	assert.Equal(t, category1.Category, categories[0].Category, "First category should be TestCategory1")
	assert.Equal(t, category2.Category, categories[1].Category, "Second category should be TestCategory2")

	// テストデータの削除
	db.Unscoped().Delete(&category1)
	db.Unscoped().Delete(&category2)
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestUpdateCategory(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テーブルのマイグレーション
	db.AutoMigrate(&UserGroup{}, &Category{})

	// テストデータの作成
	userGroup := UserGroup{
		UserGroup: "TestGroup",
	}
	db.Create(&userGroup)

	category1 := &Category{
		Category:   "TestCategory1",
		UserGroupID: userGroup.ID,
	}
	db.Create(category1)

	category2 := &Category{
		Category:   "TestCategory2",
		UserGroupID: userGroup.ID,
	}
	db.Create(category2)

	// 1. カテゴリの正常な更新
	category1.Category = "UpdatedCategory"
	err = category1.UpdateCategory(db, int(category1.ID))
	assert.Nil(t, err, "UpdateCategory should not return an error for a valid update")

	// Check if the update was successful
	updatedCategory := Category{}
	db.First(&updatedCategory, category1.ID)
	assert.Equal(t, "UpdatedCategory", updatedCategory.Category, "Category name should be updated")

	// 2. 存在しないカテゴリの更新時のエラー処理
	nonExistingCategory := &Category{
		Category: "NonExistingCategory",
	}
	err = nonExistingCategory.UpdateCategory(db, 9999) // using a non-existing ID
	assert.NotNil(t, err, "UpdateCategory should return an error for a non-existing category")

	// 3. 重複するカテゴリ名を使用しての更新時のエラー処理
	category2.Category = "UpdatedCategory"
	err = category2.UpdateCategory(db, int(category2.ID))
	assert.NotNil(t, err, "UpdateCategory should return an error for a duplicate category name")

	// テストデータの削除
	db.Unscoped().Delete(&category1)
	db.Unscoped().Delete(&category2)
	db.Unscoped().Delete(&userGroup)
}

func TestDeleteCategoryAndRelatedTasks(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テーブルのマイグレーション
	db.AutoMigrate(&UserGroup{}, &Category{}, &Task{})

	// テストデータの作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	category := &Category{
		Category:   "TestCategory",
		UserGroupID: userGroup.ID,
	}
	db.Create(category)

	creatorUser := &User{
		Name:        "Creator",
		Password:    "password123",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(creatorUser)

	responsibleUser := &User{
		Name:        "Responsible",
		Password:    "password456",
		Email:       "test@example.com",
		UserGroupID: userGroup.ID,
	}
	db.Create(responsibleUser)


	tasks := []Task{
		Task{
			Task:          "SampleTask1",
			Description:   "Description for SampleTask1",
			Creator:       creatorUser.ID,
			Responsible:   responsibleUser.ID,
			CategoryID:    category.ID,
			Status:        1,
			Estimate:      ptrToUint(5),
			StartDate:     ptrToTime(time.Now()),
		},

		Task{
			Task:          "SampleTask2",
			Description:   "Description for SampleTask2",
			Creator:       creatorUser.ID,
			Responsible:   responsibleUser.ID,
			CategoryID:    category.ID,
			Status:        2,
			Estimate:      ptrToUint(10),
			StartDate:     ptrToTime(time.Now()),
		},
	}

	for _, task := range tasks {
		db.Create(&task)
	}

	// カテゴリとそれに関連するタスクの正常な削除
	err = category.DeleteCategoryAndRelatedTasks(db, int(category.ID))
	assert.Nil(t, err, "DeleteCategoryAndRelatedTasks should not return an error for a valid delete")

	// Confirm that the category and tasks were deleted
	var count int64
	db.Model(&Category{}).Where("id = ?", category.ID).Count(&count)
	assert.Equal(t, int64(0), count, "The category should be deleted")

	db.Model(&Task{}).Where("category_id = ?", category.ID).Count(&count)
	assert.Equal(t, int64(0), count, "All tasks related to the category should be deleted")

	// 存在しないカテゴリの削除時のエラー処理
	nonExistingCategory := &Category{
		Category: "NonExistingCategory",
	}
	err = nonExistingCategory.DeleteCategoryAndRelatedTasks(db, 9999) // using a non-existing ID
	assert.NotNil(t, err, "DeleteCategoryAndRelatedTasks should return an error for a non-existing category")

	// テストデータの削除
	for _, task := range tasks {
		db.Unscoped().Delete(&task)
	}
	db.Unscoped().Delete(&creatorUser)
	db.Unscoped().Delete(&responsibleUser)
	db.Unscoped().Delete(&category)
	db.Unscoped().Delete(userGroup)
}