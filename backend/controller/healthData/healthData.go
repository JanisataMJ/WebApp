package healthData

import (
	"net/http"
	//"time"
	//"gorm.io/gorm"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

// GET /list-healthData
func ListHealthData(c *gin.Context) {

    var data []entity.HealthData

    // preload User และ HealthAnalysis เฉพาะของ user
    if err := config.DB().
        Preload("User").
        Preload("HealthAnalysis").
        Preload("HealthAnalysis.RiskLevel").
        Find(&data).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

	c.JSON(http.StatusOK, data)
}

// GET /healthData/:id
//เหมาะสำหรับหน้า Dashboard หรือ ประวัติสุขภาพแบบละเอียด
func GetHealthDataByUserID(c *gin.Context) {
	userID := c.Param("id")
	var data []entity.HealthData
	db := config.DB()

	result := db.Preload("User").
		Preload("HealthAnalysis").
		Preload("HealthAnalysis.RiskLevel").
		Where("user_id = ?", userID).
		Order("timestamp desc").
		Find(&data)
		
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}
