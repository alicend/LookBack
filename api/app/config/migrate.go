package config

import (
	"gorm.io/gorm"
	"github.com/alicend/LookBack/app/models"
)

func Migrate(db *gorm.DB) error {
	category := &models.Category{}
	if err := category.MigrateCategory(db); err != nil {
		return err
	}

	task := &models.Task{}
	if err := task.MigrateTasks(db); err != nil {
		return err
	}

	user := &models.User{}
	if err := user.MigrateUser(db); err != nil {
		return err
	}

	userGroup := &models.UserGroup{}
	if err := userGroup.MigrateUserGroup(db); err != nil {
		return err
	}

	return nil
}
