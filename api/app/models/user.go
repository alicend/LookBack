package models

import (
	"crypto/sha256"
	"fmt"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name     string `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Password string `gorm:"size:255;not null" validate:"required,min=8,max=255"`
}

type UserInput struct {
	Name     string `json:"username" binding:"required,min=1,max=255"`
	Password string `json:"password" binding:"required,min=8,max=255"`
}

func (user *User) CreateUser(db *gorm.DB) (*User, error) {

	// 自動マイグレーション(Userテーブルを作成)
	migrateErr := db.AutoMigrate(&User{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
	}

	user = &User{
		Name:     user.Name,
		Password: encrypt(user.Password),
	}
	result := db.Create(user)

	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}

func FindUserByName(db *gorm.DB, email string) (User, error) {
	var user User
	result := db.Where("name = ?", email).First(&user)

	return user, result.Error
}

func (u *User) VerifyPassword(inputPassword string) bool {
	return u.Password == encrypt(inputPassword)
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
func encrypt(char string) string {
	encryptText := fmt.Sprintf("%x", sha256.Sum256([]byte(char)))
	return encryptText
}