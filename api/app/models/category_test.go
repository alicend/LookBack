package models

import (
	"fmt"
	"time"
	"testing"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"
)

func setupDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database")
	}

	return db
}

func TestMigrateCategory(t *testing.T) {
	// テスト用のDBインスタンスを作成
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	// MigrateCategoryメソッドをテスト
	category := &Category{}
	err = category.MigrateCategory(db)
	
	assert.Nil(t, err, "MigrateCategory should not return an error")

	// テーブルが実際に作成されたことを確認
	hasTable := db.Migrator().HasTable(&Category{})
	assert.True(t, hasTable, "Category table should be created")
}

func TestMigrateCategory(t *testing.T) {
	db := setupDB()

	// マイグレーションの実行
	err := Migrate(db)
	assert.Nil(t, err, "Expected no error when migrating tables")

	category := &Category{}
	err = category.MigrateCategory(db)
	assert.Nil(t, err, "Expected no error when migrating category")
}

func TestCreateCategory(t *testing.T) {
	db := setupDB()

	// マイグレーションの実行
	err := Migrate(db)
	assert.Nil(t, err, "Expected no error when migrating tables")

	category := &Category{
		Category:    "Test Category",
		UserGroupID: 1,
	}

	err = category.CreateCategory(db)
	assert.Nil(t, err, "Expected no error when creating category")
}

func TestFetchCategory(t *testing.T) {
	db := setupDB()

	// マイグレーションの実行
	err := Migrate(db)
	assert.Nil(t, err, "Expected no error when migrating tables")

	_, err = FetchCategory(db, 1)
	assert.Nil(t, err, "Expected no error when fetching category")
}

func TestUpdateCategory(t *testing.T) {
	db := setupDB()

	// マイグレーションの実行
	err := Migrate(db)
	assert.Nil(t, err, "Expected no error when migrating tables")

	category := &Category{
		Category:    "Test Category",
		UserGroupID: 1,
	}
	category.CreateCategory(db)

	category.Category = "Updated Category"
	err = category.UpdateCategory(db, int(category.ID))
	assert.Nil(t, err, "Expected no error when updating category")
}

func TestDeleteCategoryAndRelatedTasks(t *testing.T) {
	db := setupDB()

	// マイグレーションの実行
	err := Migrate(db)
	assert.Nil(t, err, "Expected no error when migrating tables")

	category := &Category{
		Category:    "Test Category",
		UserGroupID: 1,
	}
	err = category.CreateCategory(db)
	assert.Nil(t, err, "Expected no error when creating category")

	// Add some tasks related to the category
	for i := 0; i < 3; i++ {
		startDate, err := time.Parse("2006-01-02", fmt.Sprintf("2023-08-%02d", i+23))
		if err != nil {
			t.Fatalf("Failed to parse date: %v", err)
		}

		task := &Task{
			Task:        fmt.Sprintf("Task %d", i),
			Description: fmt.Sprintf("Description for Task %d", i),
			StartDate:   &startDate,
			Estimate:    uintPtr(1 + uint(i)),
			Responsible: uint(i + 1),
			Status:      uint((i % 4) + 1),
			CategoryID:  category.ID,
		}
		err = task.CreateTask(db)
		assert.Nil(t, err, "Expected no error when creating task")
	}

	err = category.DeleteCategoryAndRelatedTasks(db, int(category.ID))
	assert.Nil(t, err, "Expected no error when deleting category and related tasks")
}
