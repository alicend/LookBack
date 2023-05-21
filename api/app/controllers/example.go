package controllers

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func Example (c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "example",
	})
}

func Test (c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "test",
	})
}
