package healthAnalysis

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

// GET /health-analysis
func ListHealthAnalysis(c *gin.Context) {
	var analysis []entity.HealthAnalysis

	// preload HealthData, RiskLevel, Notification
	if err := config.DB().
		Preload("HealthData").
		Preload("RiskLevel").
		Preload("Notification").
		Find(&analysis).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, analysis)
}

// GET /health-analysis/:id
func GetHealthAnalysis(c *gin.Context) {
	id := c.Param("id")

	// แปลง id เป็น uint
	analysisID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var analysis entity.HealthAnalysis

	if err := config.DB().
		Preload("HealthData").
		Preload("RiskLevel").
		Preload("Notification").
		First(&analysis, analysisID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "HealthAnalysis not found"})
		return
	}

	c.JSON(http.StatusOK, analysis)
}