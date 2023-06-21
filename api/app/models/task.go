package models

import (
	"time"
	"fmt"

	"gorm.io/gorm"
)


type Task struct {
	gorm.Model
	Content   string `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	UserID    uint   `gorm:"not null"`
	User      User   `gorm:"foreignKey:UserID;"`
	GroupName string `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	CompletedAt *time.Time
}

type CreateTaskInput struct {
	Content   string `json:"task" binding:"required,min=1,max=255"`
	GroupName string `json:"groupName" binding:"required,min=1,max=255"`
}

func (task *Task) CreateTask(db *gorm.DB) (*Task, error) {
	// 自動マイグレーション(Userテーブルを作成)
	migrateErr := db.AutoMigrate(&User{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
	}

	result := db.Create(task)

	if result.Error != nil {
		fmt.Printf("Error creating task: %v\n", result.Error)
		fmt.Printf("Task: %+v\n", task)
		return nil, result.Error
	}

	return task, nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================