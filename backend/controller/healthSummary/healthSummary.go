package healthSummary

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

// GET /health-summary
func ListHealthSummary(c *gin.Context) {
	var summary []entity.HealthSummary

	// โหลดพร้อม Preload User
	if err := config.DB().
		Preload("User").
		Find(&summary).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}

// GET /health-summary/:id
func GetHealthSummary(c *gin.Context) {
	id := c.Param("id")

	// แปลง id เป็น uint
	summaryID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var summary entity.HealthSummary

	// preload user + notification (ถ้าต้องการให้แสดงการแจ้งเตือนที่เกี่ยวข้อง)
	if err := config.DB().
		Preload("User").
		Preload("Notification").
		First(&summary, summaryID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "HealthSummary not found"})
		return
	}

	c.JSON(http.StatusOK, summary)
}
