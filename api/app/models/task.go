package models

import (
	"time"
	"fmt"
	"log"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Task            string   `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Description     string   `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Creator         uint     `gorm:"not null"`
	CreatorUser     User     `gorm:"foreignKey:Creator;"`
	CategoryID      uint     `gorm:"not null"`
	Category        Category `gorm:"foreignKey:CategoryID;"`
	Status          uint     `gorm:"not null"`
	Responsible     uint     `gorm:"not null"`
	ResponsibleUser User     `gorm:"foreignKey:Responsible;"`
	Estimate        uint     `gorm:"not null"`
	StartDate       *time.Time
	CompletedDate   *time.Time
}

type CreateTaskInput struct {
	Task        string `json:"Task" binding:"required,min=1,max=255"`
	Description string `json:"Description" binding:"required,min=1,max=255"`
	StartDate   string `json:"StartDate" binding:"required,min=24,max=24"`
	Estimate    uint   `json:"Estimate" binding:"required"`
	Responsible uint   `json:"Responsible" binding:"required"`
	Status      uint   `json:"Status" binding:"required"`
	CategoryID  uint   `json:"CategoryID" binding:"required"`
}

type TaskResponse struct {
	ID          uint
	Task        string
	Description string
	Creator     uint
	CategoryID  uint
	Status      uint
	Responsible uint
	Estimate    uint
	StartDate   string
}

// TableName メソッドを追加して、この構造体がタスクテーブルに対応することを指定する
func (TaskResponse) TableName() string {
	return "tasks"
}

func (task *Task) CreateTask(db *gorm.DB) (*TaskResponse, error) {
	// 自動マイグレーション(Userテーブルを作成)
	migrateErr := db.AutoMigrate(&Task{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
	}

	result := db.Create(task)

	if result.Error != nil {
		log.Printf("Error creating task: %v\n", result.Error)
		log.Printf("Task: %+v\n", task)
		return nil, result.Error
	}
	log.Printf("タスクの作成に成功")

	// StartDateを*time.Time型からstring型に変換
	layout := "2006-01-02T15:04:05Z07:00"
	startDate := task.StartDate.Format(layout)

	// TaskオブジェクトをTaskResponseオブジェクトに変換
	taskResponse := &TaskResponse{
		ID:          task.ID,
		Task:        task.Task,
		Description: task.Description,
		Creator:     task.Creator,
		CategoryID:  task.CategoryID,
		Status:      task.Status,
		Responsible: task.Responsible,
		Estimate:    task.Estimate,
		StartDate:   startDate,
	}

	return taskResponse, nil
}

func FetchTasks(db *gorm.DB) ([]TaskResponse, error) {
	var tasks []TaskResponse

	result := db.Order("created_at asc").Find(&tasks)

	if result.Error != nil {
		log.Printf("Error fetching tasks: %v\n", result.Error)
		return nil, result.Error
	}
	log.Printf("タスクの取得に成功")

	return tasks, nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================