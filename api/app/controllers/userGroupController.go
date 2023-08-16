package controllers

import (
	"net/http"
	"log"

	"github.com/gin-gonic/gin"

	"github.com/alicend/LookBack/app/models"
)

func (handler *Handler) CreateUserGroupHandler(c *gin.Context) {
	var createUserGroupInput models.UserGroupInput
	if err := c.ShouldBindJSON(&createUserGroupInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	newUserGroup := &models.UserGroup{
		UserGroup:   createUserGroupInput.UserGroup,
	}

	err := newUserGroup.CreateUserGroup(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	user_groups, err := models.FetchUserGroups(handler.DB)
	if err != nil {
		log.Printf("ユーザーグループの取得に失敗しました")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_groups" : user_groups,  // user_groups
	})
}

func (handler *Handler) GetUserGroupsHandler(c *gin.Context) {

	user_groups, err := models.FetchUserGroups(handler.DB)
	if err != nil {
		log.Printf("Failed to fetch user_groups: %v", err)
		log.Printf("ユーザーグループの取得に失敗しました")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_groups" : user_groups,  // user_groupsをレスポンスとして返す
	})
}

func (handler *Handler) UpdateUserGroupHandler(c *gin.Context) {
	var updateCategoryInput models.CategoryInput
	if err := c.ShouldBindJSON(&updateCategoryInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	updateCategory := &models.Category{
		Category: updateCategoryInput.Category,
	}
	
	// URLからtaskのidを取得
	taskID, err := getIdFromURLTail(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	err = updateCategory.UpdateCategory(handler.DB, taskID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}
	
	categories, err := models.FetchCategory(handler.DB, userID)
	if err != nil {
		log.Printf("Failed to fetch categories: %v", err)
		log.Printf("カテゴリーの取得に失敗しました")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	tasks, err := models.FetchTaskBoardTasks(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories" : categories,  // categoriesをレスポンスとして返す
		"tasks"      : tasks,       // tasksをレスポンスとして返す
	})
}

func (handler *Handler) DeleteUserGroupHandler(c *gin.Context) {

	// URLからtaskのidを取得
	taskID, err := getIdFromURLTail(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	deleteCategory := &models.Category{}

	err = deleteCategory.DeleteCategoryAndRelatedTasks(handler.DB, taskID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}

	categories, err := models.FetchCategory(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	tasks, err := models.FetchTaskBoardTasks(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories" : categories,  // categoriesをレスポンスとして返す
		"tasks"      : tasks,       // tasksをレスポンスとして返す
	})
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
