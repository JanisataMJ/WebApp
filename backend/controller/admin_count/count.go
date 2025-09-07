package count

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

// Dashboard summary: users, admins, articles
func GetAdminCounts(c *gin.Context) {
	db := config.DB()

	var userCount int64
	var adminCount int64
	var articleCount int64

	// ✅ นับจำนวน User 
	db.Model(&entity.User{}).Where("role_id = ?", 2).Count(&userCount)

	// ✅ นับจำนวน Admin
	db.Model(&entity.User{}).Where("role_id = ?", 1).Count(&adminCount)

	// ✅ นับจำนวน Article ทั้งหมด
	db.Model(&entity.Article{}).Count(&articleCount)

	c.JSON(http.StatusOK, gin.H{
		"users":    userCount,
		"admins":   adminCount,
		"articles": articleCount,
	})
}
