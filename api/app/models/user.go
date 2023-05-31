package models

import (
	"crypto/sha256"
	"fmt"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name     string `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Email    string `gorm:"size:255;not null" validate:"required,email"`
	Password string `gorm:"size:255;not null" validate:"required,min=8,max=255"`
}

type SignUpInput struct {
	Name     string `json:"name" binding:"required,min=1,max=255"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=255"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
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
		Email:    user.Email,
		Password: encrypt(user.Password),
	}
	result := db.Create(user)

	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}

func FindUserByEmail(db *gorm.DB, email string) (User, error) {
	var user User
	result := db.Where("email = ?", email).First(&user)

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