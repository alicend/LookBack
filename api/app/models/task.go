package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Task      string `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	UserID    uint   `gorm:"not null"`
	User      User   `gorm:"foreignKey:UserID;"`
	Completed bool   `gorm:"not null;default:false"`
	CompletedAt *time.Time
}

type CreateTaskInput struct {
	Task string `json:"task" binding:"required,min=1,max=255"`
}

func (task *Task) CreateTask(db *gorm.DB) (*Task, error) {

	// 自動マイグレーション(Userテーブルを作成)
	migrateErr := db.AutoMigrate(&Task{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
	}

	task = &Task{
		Task:   task.Task,
		UserID: task.UserID,
	}
	result := db.Create(task)

	if result.Error != nil {
		return nil, result.Error
	}

	return task, nil
} 

// ==================================================================
// 以下はプライベート関数
// ==================================================================