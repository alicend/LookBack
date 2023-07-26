package controllers

import (
	"net/http"
	"log"

	"github.com/gin-gonic/gin"

	"github.com/alicend/LookBack/app/models"
)

func (handler *Handler) CreateCategoryHandler(c *gin.Context) {
	var createCategoryInput models.CategoryInput
	if err := c.ShouldBindJSON(&createCategoryInput); err != nil {
		log.Printf("Invalid request body: %v", err)
		log.Printf("リクエスト内容が正しくありません")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	newCategory := &models.Category{
		Category:   createCategoryInput.Category,
	}

	category, err := newCategory.CreateCategory(handler.DB)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"category" : category,
	})
}

func (handler *Handler) GetCategoryHandler(c *gin.Context) {

	categories, err := models.FetchCategory(handler.DB)
	if err != nil {
		log.Printf("Failed to fetch categories: %v", err)
		log.Printf("カテゴリーの取得に失敗しました")
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories" : categories,  // categoriesをレスポンスとして返す
	})
}

func (handler *Handler) UpdateCategoryHandler(c *gin.Context) {
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
	id, err := getIdFromURL(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	category, err := updateCategory.UpdateCategory(handler.DB, id)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"category" : category,
	})
}

func (handler *Handler) DeleteCategoryHandler(c *gin.Context) {

	// URLからtaskのidを取得
	id, err := getIdFromURL(c)
	if err != nil {
		respondWithErrAndMsg(c, http.StatusBadRequest, err.Error(), "IDのフォーマットが不正です")
		return
	}

	deleteCategory := &models.Category{}

	err = deleteCategory.DeleteCategory(handler.DB, id)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully deleted task",
	})
}

// ==================================================================
// 以下はプライベート関数
// ==================================================================
