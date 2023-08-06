package models

import (
	"crypto/sha256"
	"fmt"
	"log"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name        string    `gorm:"size:255;not null" validate:"required,min=1,max=255"`
	Password    string    `gorm:"size:255;not null" validate:"required,min=8,max=255"`
	UserGroupID uint      `gorm:"not null"`
	UserGroup   UserGroup `gorm:"foreignKey:UserGroupID;"`
}

type UserInput struct {
	Name        string `json:"username" binding:"required,min=1,max=255"`
	Password    string `json:"password" binding:"required,min=8,max=255"`
	UserGroupID uint   `json:"user_group_id" binding:"required,min=8,max=255"`
}

type UserUpdateInput struct {
	NewName         string `json:"new_username" binding:"required,min=1,max=255"`
	CurrentPassword string `json:"current_password" binding:"required,min=8,max=255"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=255"`
}

// ユーザー一覧取得
type UserResponse struct {
	ID   uint
	Name string
}

// TableName メソッドを追加して、この構造体がユーザーテーブルに対応することを指定する
func (UserResponse) TableName() string {
	return "users"
}

func (user *User) CreateUser(db *gorm.DB) (*User, error) {

	// 自動マイグレーション(Userテーブルを作成)
	migrateErr := db.AutoMigrate(&User{})
	if migrateErr != nil {
		panic(fmt.Sprintf("failed to migrate database: %v", migrateErr))
		return nil, migrateErr
	}

	user = &User{
		Name:        user.Name,
		Password:    encrypt(user.Password),
		UserGroupID: user.UserGroupID,
	}
	result := db.Create(user)

	if result.Error != nil {
		log.Printf("Error creating user: %v", result.Error)
		return nil, result.Error
	}
	log.Printf("ユーザーの作成に成功")

	return user, nil
}

func FindUserByIDWithoutPassword(db *gorm.DB, userID uint) (UserResponse, error) {
	var user UserResponse
	result := db.Where("ID = ?", userID).First(&user)

	if result.Error != nil {
		log.Printf("Error fetching user: %v", result.Error)
		return user, result.Error
	}
	log.Printf("ユーザーの取得に成功")

	return user, nil
}

func FindUserByID(db *gorm.DB, userID uint) (User, error) {
	var user User
	result := db.Where("ID = ?", userID).First(&user)

	if result.Error != nil {
		log.Printf("Error fetching user: %v", result.Error)
		return user, result.Error
	}
	log.Printf("ユーザーの取得に成功")

	return user, nil
}

func FindUserByName(db *gorm.DB, name string) (User, error) {
	var user User
	result := db.Where("name = ?", name).First(&user)

	if result.Error != nil {
		log.Printf("Error fetching user: %v", result.Error)
		return user, result.Error
	}
	log.Printf("ユーザーの取得に成功")

	return user, nil
}

func FindUsersAll(db *gorm.DB) ([]UserResponse, error) {
	var users []UserResponse
	result := db.Select("id", "Name").Order("Name asc").Find(&users)

	if result.Error != nil {
		log.Printf("Error fetching users: %v", result.Error)
		return nil, result.Error
	}
	log.Printf("ユーザーの取得に成功")

	return users, nil
}

func (user *User) UpdateUser(db *gorm.DB, userID uint) error {
	result := db.Model(user).Where("id = ?", userID).Updates(User{
		Name:     user.Name,
		Password: user.Password,
	})

	if result.Error != nil {
		log.Printf("Error updating user: %v\n", result.Error)
		return result.Error
	}
	log.Printf("ユーザーの更新に成功")

	return nil
}

func (user *User) DeleteUserAndRelatedTasks(db *gorm.DB, id uint) error {
	tx := db.Begin()
	if tx.Error != nil {
		log.Printf("Error starting transaction: %v\n", tx.Error)
		return tx.Error
	}

	if err := deleteUserTasks(tx, id); err != nil {
		log.Println(err)
		tx.Rollback()
		return err
	}

	if err := tx.Unscoped().Where("id = ?", id).Delete(&User{}).Error; err != nil {
		log.Printf("Error deleting user: %v\n", err)
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}

	log.Printf("ユーザーの削除に成功")
	return nil
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