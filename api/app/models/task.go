package models

import (
	"time"
	"fmt"
	"log"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Task              string   `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Description       string   `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Creator           uint     `gorm:"not null"`
	CreatorUserID     User     `gorm:"foreignKey:Creator;"`
	CategoryID        uint     `gorm:"not null"`
	Category          Category `gorm:"foreignKey:CategoryID;"`
	Status            uint     `gorm:"not null"`
	Responsible       uint     `gorm:"not null"`
	ResponsibleUserID User     `gorm:"foreignKey:Responsible;"`
	Estimate          uint     `gorm:"not null"`
	StartDate         *time.Time
	CompletedDate     *time.Time
}

type CreateTaskInput struct {
	Task        string `json:"Task" binding:"required,min=1,max=255"`
	Description string `json:"Description" binding:"required,min=1,max=255"`
	StartDate   string `json:"StartDate" binding:"required,min=24,max=24"`
	Estimate    uint   `json:"Estimate" binding:"required"`
	Responsible uint   `json:"Responsible" binding:"required"`
	Status      uint   `json:"Status" binding:"required"`
	CategoryID  uint   `json:"Category" binding:"required"`
}

type TaskResponse struct {
	ID                  uint
	Task                string
	Description         string
	Status              uint
	StatusName          string
	Category            uint
	CategoryName        string
	Estimate            uint
	StartDate           string
	Responsible         uint
	ResponsibleUserName string
	Creator             uint
	CreatorUserName     string
	CreatedAt           string
	UpdatedAt           string
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

	// TaskオブジェクトをTaskResponseオブジェクトに変換
	taskResponse := &TaskResponse{
		ID:                  task.ID,
		Task:                task.Task,
		Description:         task.Description,
		Status:              task.Status,
		StatusName:          statusToString(task.Status),
		Category:            task.Category.ID,
		CategoryName:        task.Category.Category,
		Estimate:            task.Estimate,
		StartDate:           task.StartDate.String(),
		Responsible:         task.ResponsibleUserID.ID,
		ResponsibleUserName: task.ResponsibleUserID.Name,
		Creator:             task.CreatorUserID.ID,
		CreatorUserName:     task.CreatorUserID.Name,
	}

	return taskResponse, nil
}

func FetchTasks(db *gorm.DB) ([]TaskResponse, error) {
	var tasks []Task

	result := db.Preload("CreatorUserID").Preload("ResponsibleUserID").Preload("Category").Order("created_at asc").Find(&tasks)

	if result.Error != nil {
		log.Printf("Error fetching tasks: %v\n", result.Error)
		return nil, result.Error
	}
	log.Printf("タスクの取得に成功")

	taskResponses := make([]TaskResponse, len(tasks))
	for i, task := range tasks {
		log.Printf("Task: %+v\n", task)

		taskResponses[i] = TaskResponse{
			ID:                  task.ID,
			Task:                task.Task,
			Description:         task.Description,
			Status:              task.Status,
			StatusName:          statusToString(task.Status),
			Category:            task.Category.ID,
			CategoryName:        task.Category.Category,
			Estimate:            task.Estimate,
			StartDate:           task.StartDate.Format("2006-01-02"),
			Responsible:         task.ResponsibleUserID.ID,
			ResponsibleUserName: task.ResponsibleUserID.Name,
			Creator:             task.CreatorUserID.ID,
			CreatorUserName:     task.CreatorUserID.Name,
			CreatedAt:           task.CreatedAt.Format("2006-01-02 15:04"),
			UpdatedAt:           task.UpdatedAt.Format("2006-01-02 15:04"),
		}
	}

	return taskResponses, nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
func statusToString(status uint) string {
	switch status {
	case 1:
		return "Not started"
	case 2:
		return "On going"
	case 3:
		return "Done"
	default:
		return "Unknown status"
	}
}