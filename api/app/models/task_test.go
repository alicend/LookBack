package models

import (
	"time"
	"testing"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"

	"github.com/alicend/LookBack/app/constant"
)

func TestMigrateTasks(t *testing.T) {
	// MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// MigrateTasks関数をテスト
	task := &Task{}
	err = task.MigrateTasks(db)
	assert.Nil(t, err, "MigrateTasks should not return an error")

	// Tasksテーブルが正しく作成されているかを確認
	hasTable := db.Migrator().HasTable(&Task{})
	assert.True(t, hasTable, "Task table should be created")
}

func TestCreateTask(t *testing.T) {
	// MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テストデータの作成
	userGroup := &UserGroup{
		UserGroup: "Sample UserGroup",
	}
	if err := db.Create(&userGroup).Error; err != nil {
		t.Fatalf("failed to create user group: %v", err)
	}

	user := &User{
		Name:        "Test User",
		Password:    "testPassword123",
		UserGroupID: userGroup.ID,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	category := &Category{
		Category:    "Sample Category",
		UserGroupID: userGroup.ID,
	}
	if err := db.Create(&category).Error; err != nil {
		t.Fatalf("failed to create category: %v", err)
	}

	testTask := &Task{
		Task:         "Sample Task",
		Description:  "This is a test task",
		Creator:      user.ID,
		CategoryID:   category.ID,
		Status:       1,
		Responsible:  user.ID,
		Estimate:     ptrToUint(5),
		StartDate:    ptrToTime(time.Now()),
	}

	err = testTask.CreateTask(db)
	assert.Nil(t, err, "CreateTask should not return an error")

	// データベースに追加されたタスクが正しいかどうかを確認
	var fetchedTask Task
	db.First(&fetchedTask, testTask.ID)

	assert.Equal(t, testTask.Task, fetchedTask.Task, "Added task should match the test task")
	assert.Equal(t, testTask.Description, fetchedTask.Description, "Added task description should match the test task description")

	// テストデータの削除
	db.Unscoped().Delete(&testTask)
	db.Unscoped().Delete(&category)
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestFetchTaskBoardTasks(t *testing.T) {
	// MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テストデータの作成
	userGroup := &UserGroup{
		UserGroup: "Sample UserGroup",
	}
	if err := db.Create(&userGroup).Error; err != nil {
		t.Fatalf("failed to create user group: %v", err)
	}

	user := &User{
		Name:        "Test User",
		Password:    "testPassword123", 
		UserGroupID: userGroup.ID,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	category := &Category{
		Category:    "Sample Category",
		UserGroupID: userGroup.ID,
	}
	if err := db.Create(&category).Error; err != nil {
		t.Fatalf("failed to create category: %v", err)
	}

	task := &Task{
		Task:         "Sample Task",
		Description:  "This is a test task",
		Creator:      user.ID,
		CategoryID:   category.ID,
		Status:       1,
		Responsible:  user.ID,
		Estimate:     ptrToUint(5),
		StartDate:    ptrToTime(time.Now()),
	}
	if err := db.Create(&task).Error; err != nil {
		t.Fatalf("failed to create task: %v", err)
	}

	taskResponses, err := FetchTaskBoardTasks(db, user.ID)
	if err != nil {
		t.Fatalf("FetchTaskBoardTasks returned an error: %v", err)
	}

	if len(taskResponses) != 1 {
		t.Fatalf("expected 1 task, got %d", len(taskResponses))
	}

	response := taskResponses[0]
	assert.Equal(t, task.Task, response.Task, "The task name should match")

	// テストデータの削除
	db.Unscoped().Delete(&task)
	db.Unscoped().Delete(&category)
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&userGroup)
}

func TestFetchLookBackTasks(t *testing.T) {
	// テスト用MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// テーブルのマイグレーション
	db.AutoMigrate(&UserGroup{}, &Category{}, &User{}, &Task{})

	// テストデータの作成
	userGroup := &UserGroup{
		UserGroup: "TestUserGroup",
	}
	db.Create(userGroup)

	user := &User{
		Name:        "TestUser",
		Password:    "testPassword",
		UserGroupID: userGroup.ID,
	}
	db.Create(user)

	category := &Category{
		Category:   "TestCategory",
		UserGroupID: userGroup.ID,
	}
	db.Create(category)

	task := &Task{
		Task:        "TestTask",
		Description: "TestDescription",
		Creator:     user.ID,
		CategoryID:  category.ID,
		Status:      4,
		Responsible: user.ID,
		Estimate:    ptrToUint(5),
		StartDate:   ptrToTime(time.Now()),
	}
	db.Create(task)

	// FetchLookBackTasks関数の実行
	taskResponses, err := FetchLookBackTasks(db, user.ID)
	assert.Nil(t, err, "FetchLookBackTasks should not return an error")
	assert.Equal(t, 1, len(taskResponses), "Should fetch one look back task")

	fetchedTask := taskResponses[0]
	assert.Equal(t, task.ID, fetchedTask.ID, "Fetched task ID should match the test task ID")

	// テストデータの削除
	db.Unscoped().Delete(&task)
	db.Unscoped().Delete(&user)
	db.Unscoped().Delete(&category)
	db.Unscoped().Delete(&userGroup)
}

func ptrToUint(u uint) *uint {
	return &u
}

func ptrToTime(t time.Time) *time.Time {
	return &t
}
