package healthData

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

// GET /health-data
func ListHealthData(c *gin.Context) {
	var healthDataList []entity.HealthData

	// Preload User และ AnalysisResults ด้วย
	if err := config.DB().
		Preload("User").
		Preload("AnalysisResults").
		Find(&healthDataList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// กรองข้อมูลถ้าต้องการ (ตัวอย่าง: ข้าม Timestamp ว่าง)
	var validHealthData []entity.HealthData
	for _, hd := range healthDataList {
		if hd.Timestamp.IsZero() {
			continue
		}
		validHealthData = append(validHealthData, hd)
	}

	c.JSON(http.StatusOK, validHealthData)
}

// GET /health-data/:id
func GetHealthData(c *gin.Context) {
	id := c.Param("id")

	// แปลงเป็น uint
	healthDataID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var healthData entity.HealthData

	if err := config.DB().
		Preload("User").
		Preload("AnalysisResults").
		First(&healthData, healthDataID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "HealthData not found"})
		return
	}

	c.JSON(http.StatusOK, healthData)
}
