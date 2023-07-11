package controllers

import (
	"net/http"
	"log"

	"github.com/gin-gonic/gin"

	"github.com/alicend/LookBack/app/constant"
	"github.com/alicend/LookBack/app/models"
)

func (handler *Handler) CreateCategoryHandler(c *gin.Context) {
	log.Println("This is a simple log.1")
	var createCategoryInput models.CreateCategoryInput
	if err := c.ShouldBindJSON(&createCategoryInput); err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "Invalid request body")
		return
	}
	log.Println("This is a simple log.2")
	
	newCategory := &models.Category{
		Category:   createCategoryInput.Category,
	}

	category, err := newCategory.CreateCategory(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to create category")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message"  : "Successfully created category",
		"category" : category,
	})
}

func (handler *Handler) GetCategoryHandler(c *gin.Context) {
	// Cookie内のjwtからUSER_IDを取得
	userID, err := extractUserID(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Failed to extract user ID")
		return
	}

	tasks, err := models.FetchTasksByUserID(handler.DB, userID)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Failed to fetch task")
		return
	}

	
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully got task",
		"tasks"   : tasks,  // tasksをレスポンスとして返す
	})
}

func (handler *Handler) DeleteTaskHandler(c *gin.Context) {
	c.SetCookie(constant.JWT_TOKEN_NAME, "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully deleted task",
	})
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
