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
	var updateUserGroupInput models.UserGroupInput
	if err := c.ShouldBindJSON(&updateUserGroupInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	updateUserGroup := &models.UserGroup{
		UserGroup: updateUserGroupInput.UserGroup,
	}
	
	// URLからuserGroupのidを取得
	userGroupID, err := getIdFromURLTail(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	err = updateUserGroup.UpdateUserGroup(handler.DB, userGroupID)
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

func (handler *Handler) DeleteUserGroupHandler(c *gin.Context) {

	// URLからuser-groupのidを取得
	userGroupID, err := getIdFromURLTail(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	deleteUserGroup := &models.UserGroup{}

	err = deleteUserGroup.DeleteUserGroupAndRelatedUsers(handler.DB, userGroupID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
