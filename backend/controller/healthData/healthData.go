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
	var data []entity.HealthData

	// preload User และ HealthAnalysis
	if err := config.DB().
		Preload("User").
		Preload("HealthAnalysis").
		Find(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}

// GET /health-data/:id
func GetHealthData(c *gin.Context) {
	id := c.Param("id")

	// แปลง id เป็น uint
	dataID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var healthData entity.HealthData

	// preload User และ HealthAnalysis
	if err := config.DB().
		Preload("User").
		Preload("HealthAnalysis").
		First(&healthData, dataID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "HealthData not found"})
		return
	}

	c.JSON(http.StatusOK, healthData)
}
