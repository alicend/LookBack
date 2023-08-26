package models

import (
	"testing"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"

	"github.com/alicend/LookBack/app/constant"
)

func TestMigrate(t *testing.T) {
	// MySQLデータベースに接続
	db, err := gorm.Open(mysql.Open(constant.TEST_DSN), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to MySQL database: %v", err)
	}

	// Migrate関数をテスト
	err = Migrate(db)
	assert.Nil(t, err, "Migrate should not return an error")

	// 各テーブルが正しく作成されているかを確認
	var hasTable bool

	hasTable = db.Migrator().HasTable(&Category{})
	assert.True(t, hasTable, "Category table should be created")

	hasTable = db.Migrator().HasTable(&Task{})
	assert.True(t, hasTable, "Task table should be created")

	hasTable = db.Migrator().HasTable(&User{})
	assert.True(t, hasTable, "User table should be created")

	hasTable = db.Migrator().HasTable(&UserGroup{})
	assert.True(t, hasTable, "UserGroup table should be created")
}
