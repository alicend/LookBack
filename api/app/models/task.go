package models

import (
	"time"
	"fmt"
	"log"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	Task              string     `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Description       string     `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Creator           uint       `gorm:"not null"`
	CreatorUserID     User       `gorm:"foreignKey:Creator;"`
	CategoryID        uint       `gorm:"not null"`
	Category          Category   `gorm:"foreignKey:CategoryID;"`
	Status            uint       `gorm:"not null" validate:"required,min=1,max=4"`
	Responsible       uint       `gorm:"not null"`
	ResponsibleUserID User       `gorm:"foreignKey:Responsible;"`
	Estimate          *uint      `gorm:"not null" validate:"required,min=1,max=1000"`
	StartDate         *time.Time `gorm:"not null"`
}

type TaskInput struct {
	Task        string `json:"Task" binding:"required,min=1,max=255"`
	Description string `json:"Description" binding:"required,min=1,max=255"`
	StartDate   string `json:"StartDate" binding:"required,min=1,max=24"`
	Estimate    *uint  `json:"Estimate" binding:"required",min=1,max=1000"`
	Responsible uint   `json:"Responsible" binding:"required"`
	Status      uint   `json:"Status" binding:"required", min=1,max=4"`
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
	Estimate            *uint
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

func (task *Task) CreateTask(db *gorm.DB) (error) {
	// 自動マイグレーション(Userテーブルを作成)
	migrateErr := db.AutoMigrate(&Task{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
		return migrateErr
	}

	result := db.Create(task)

	if result.Error != nil {
		log.Printf("Error creating task: %v\n", result.Error)
		return result.Error
	}
	log.Printf("タスクの作成に成功")

	return nil
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

func (task *Task) UpdateTask(db *gorm.DB, id int) (error) {

	result := db.Model(task).Where("id = ?", id).Updates(Task{
		Task:        task.Task,
		Description: task.Description,
		CategoryID:  task.CategoryID,
		Status:      task.Status,
		Responsible: task.Responsible,
		Estimate:    task.Estimate,
		StartDate:   task.StartDate,
	})

	if result.Error != nil {
		log.Printf("Error updating task: %v\n", result.Error)
		return result.Error
	}
	log.Printf("タスクの更新に成功")

	return nil
}

func (task *Task) DeleteTask(db *gorm.DB, id int) error {

	result := db.Unscoped().Delete(task, id)

	if result.Error != nil {
		log.Printf("Error deleting task: %v\n", result.Error)
		return result.Error
	}

	log.Printf("タスクの削除に成功")

	return nil
}

func deleteUserTasks(tx *gorm.DB, userID uint) error {
	// Creatorに関連するタスクを削除
	if err := tx.Unscoped().Where("creator = ?", userID).Delete(&Task{}).Error; err != nil {
		return fmt.Errorf("error deleting tasks by creator: %v", err)
	}

	// Responsibleに関連するタスクを削除
	if err := tx.Unscoped().Where("responsible = ?", userID).Delete(&Task{}).Error; err != nil {
		return fmt.Errorf("error deleting tasks by responsible: %v", err)
	}

	return nil
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
func statusToString(status uint) string {
	switch status {
	case 1:
		return "未着"
	case 2:
		return "進行中"
	case 3:
		return "完了"
	case 4:
		return "Look Back"
	default:
		return "Unknown status"
	}
}