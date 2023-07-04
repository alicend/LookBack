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
	Status    string `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	TaskIndex uint   `gorm:"not null"`
	CompletedAt *time.Time
}

type CreateTaskInput struct {
	Content   string `json:"task" binding:"required,min=1,max=255"`
	Status    string `json:"status" binding:"required,min=1,max=255"`
	TaskIndex uint   `json:"task_index" binding:"required`
}

type Move struct {
	DragIndex  int    `json:"dragIndex" binding:"required"`
	HoverIndex int    `json:"hoverIndex" binding:"required"`
	Status     string `json:"status" binding:"required,min=1,max=255"`
}

func (task *Task) CreateTask(db *gorm.DB) (*Task, error) {
	// 自動マイグレーション(Userテーブルを作成)
	migrateErr := db.AutoMigrate(&Task{})
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

func FetchTasksByUserID(db *gorm.DB, userID uint) ([]Task, error) {
	var tasks []Task

	result := db.Where("user_id = ?", userID).Order("task_index asc").Find(&tasks)

	if result.Error != nil {
		fmt.Printf("Error fetching tasks: %v\n", result.Error)
		return nil, result.Error
	}

	return tasks, nil
}

func (move *Move) UpdateTaskForMove(db *gorm.DB, userID uint) error {
	var tasks []Task

	result := db.Where("user_id = ?", userID).Order("task_index asc").Find(&tasks)

	if result.Error != nil {
			fmt.Printf("Error fetching tasks: %v\n", result.Error)
			return result.Error
	}

	if move.DragIndex < 0 || move.DragIndex >= len(tasks) || move.HoverIndex < 0 || move.HoverIndex >= len(tasks) {
			return fmt.Errorf("invalid indices: dragIndex = %d, hoverIndex = %d", move.DragIndex, move.HoverIndex)
	}

	// TaskIndexを入れ替える
	tasks[move.DragIndex].TaskIndex, tasks[move.HoverIndex].TaskIndex = tasks[move.HoverIndex].TaskIndex, tasks[move.DragIndex].TaskIndex

	// Statusを更新
	tasks[move.DragIndex].Status = move.Status

	// DBに保存
	db.Save(&tasks[move.DragIndex])
	db.Save(&tasks[move.HoverIndex])

	return nil
}




// ==================================================================
// 以下はプライベート関数
// ==================================================================