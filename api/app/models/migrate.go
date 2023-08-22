package models

import (
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	category := &Category{}
	if err := category.MigrateCategory(db); err != nil {
		return err
	}

	task := &Task{}
	if err := task.MigrateTasks(db); err != nil {
		return err
	}

	user := &User{}
	if err := user.MigrateUser(db); err != nil {
		return err
	}

	userGroup := &UserGroup{}
	if err := userGroup.MigrateUserGroup(db); err != nil {
		return err
	}

	return nil
}
