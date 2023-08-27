package models

import (
	"crypto/sha256"
	"fmt"
	"log"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name        string    `gorm:"size:255;not null" validate:"required,min=1,max=30"`
	Password    string    `gorm:"size:255;not null" validate:"required,min=8,max=255"`
	Email       string    `gorm:"size:255;not null;unique" validate:"required,email"`
	UserGroupID uint      `gorm:"not null"`
	UserGroup   UserGroup `gorm:"foreignKey:UserGroupID;"`
}

type UserLoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=255"`
}

type UserSignUpInput struct {
	Name      string `json:"username" binding:"required,min=1,max=30"`
	Password  string `json:"password" binding:"required,min=8,max=255"`
	Email     string `json:"email" binding:"required,email"`
	UserGroup string `json:"user_group" binding:"required,min=1,max=30"`
}

type EmailUpdateInput struct {
	NewEmail string `json:"email" binding:"required,email"`
}

type UsernameUpdateInput struct {
	NewName string `json:"username" binding:"required,min=1,max=30"`
}

type UserPasswordUpdateInput struct {
	CurrentPassword string `json:"current_password" binding:"required,min=8,max=255"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=255"`
}

type UserGroupUpdateInput struct {
	NewUserGroupID uint `json:"user_group_id" binding:"required,min=1,max=30"`
}

type UserResponse struct {
	ID   uint
	Name string
}

type CurrentUserResponse struct {
	ID          uint
	Email       string
	Name        string
	UserGroupID uint
	UserGroup   string
}

// TableName メソッドを追加して、この構造体がユーザーテーブルに対応することを指定する
func (UserResponse) TableName() string {
	return "users"
}

// TableName メソッドを追加して、この構造体がユーザーテーブルに対応することを指定する
func (CurrentUserResponse) TableName() string {
	return "users"
}

func (user *User) MigrateUser(db *gorm.DB) error {
	// 自動マイグレーション(Userテーブルを作成)
	migrateErr := db.AutoMigrate(&User{})
	if migrateErr != nil {
		log.Printf("failed to migrate database: %v", migrateErr)
		return migrateErr
	}

	return nil
}

func (user *User) CreateUser(db *gorm.DB) (*User, error) {
	// 既存のユーザーとメールアドレスが重複がないか確認
	var existingUser User
	if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err != gorm.ErrRecordNotFound {
		log.Printf("User with email %s already exists", user.Email)
		return nil, fmt.Errorf("入力したメールアドレスは登録済みです")
	}

	user = &User{
		Name:        user.Name,
		Password:    encrypt(user.Password),
		Email:       user.Email,
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

func FindUserByIDWithoutPassword(db *gorm.DB, userID uint) (CurrentUserResponse, error) {
	var user CurrentUserResponse
	result := db.Table("users").Select("users.id, users.email, users.name, users.user_group_id, user_groups.user_group").
		Joins("left join user_groups on user_groups.id = users.user_group_id").
		Where("users.id = ?", userID).
		First(&user)

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

func FindUserByEmail(db *gorm.DB, email string) (User, error) {
	var user User
	result := db.Where("email = ?", email).First(&user)

	if result.Error != nil {
		log.Printf("Error fetching user: %v", result.Error)
		return user, result.Error
	}
	log.Printf("ユーザーの取得に成功")

	return user, nil
}

func FindUserByNameAndUserGroup(db *gorm.DB, name string, userGroupID uint) (User, error) {
	var user User
	result := db.Where("name = ? AND user_group_id = ?", name, userGroupID).First(&user)

	if result.Error != nil {
		log.Printf("Error fetching user: %v", result.Error)
		return user, result.Error
	}
	log.Printf("ユーザーの取得に成功")

	return user, nil
}

func FindUsersAll(db *gorm.DB, userID uint) ([]UserResponse, error) {
	userGroupID, err := FetchUserGroupIDByUserID(db, userID)
	if err != nil {
		return nil, err
	}

	var users []UserResponse
	result := db.
		Select("id", "Name").
		Where("user_group_id = ?", userGroupID).
		Order("Name asc").
		Find(&users)

	if result.Error != nil {
		log.Printf("Error fetching users: %v", result.Error)
		return nil, result.Error
	}
	log.Printf("ユーザーの取得に成功")

	return users, nil
}

func (user *User) UpdateEmail(db *gorm.DB, userID uint) error {
	// 既存のユーザー情報を取得
	var existingUser User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		log.Printf("Error fetching user with ID %d: %v\n", userID, err)
		return fmt.Errorf("ユーザーが見つかりません")
	}
	
	// 既存のユーザーと重複がないか確認
	if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err != gorm.ErrRecordNotFound {
		log.Printf("User with name %s already exists in user group %d", user.Name, existingUser.UserGroupID)
		return fmt.Errorf("入力したメールアドレス他のユーザーが登録済みです")
	}

	result := db.Model(user).Where("id = ?", userID).Updates(User{
		Email: user.Email,
	})

	if result.Error != nil {
		log.Printf("Error updating user: %v\n", result.Error)
		return result.Error
	}
	log.Printf("ログインユーザーのユーザー名の更新に成功")

	return nil
}

func (user *User) UpdateUsername(db *gorm.DB, userID uint) error {
	// 既存のユーザー情報を取得
	var existingUser User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		log.Printf("Error fetching user with ID %d: %v\n", userID, err)
		return fmt.Errorf("ユーザーが見つかりません")
	}
	
	// 既存のユーザーと重複がないか確認
	if err := db.Where("name = ? AND user_group_id = ?", user.Name, existingUser.UserGroupID).First(&existingUser).Error; err != gorm.ErrRecordNotFound {
		log.Printf("User with name %s already exists in user group %d", user.Name, existingUser.UserGroupID)
		return fmt.Errorf("入力したユーザー名は現在所属するユーザーグループに登録済みです")
	}

	result := db.Model(user).Where("id = ?", userID).Updates(User{
		Name: user.Name,
	})

	if result.Error != nil {
		log.Printf("Error updating user: %v\n", result.Error)
		return result.Error
	}
	log.Printf("ログインユーザーのユーザー名の更新に成功")

	return nil
}

func (user *User) UpdateUserPassword(db *gorm.DB, userID uint) error {
	result := db.Model(user).Where("id = ?", userID).Updates(User{
		Password: user.Password,
	})

	if result.Error != nil {
		log.Printf("Error updating user: %v\n", result.Error)
		return result.Error
	}
	log.Printf("ログインユーザーのパスワードの更新に成功")

	return nil
}

func (user *User) UpdateUserGroup(db *gorm.DB, userID uint) error {
	result := db.Model(user).Where("id = ?", userID).Updates(User{
		UserGroupID: user.UserGroupID,
	})

	if result.Error != nil {
		log.Printf("Error updating user: %v\n", result.Error)
		return result.Error
	}
	log.Printf("ログインユーザーのユーザーグループの更新に成功")

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