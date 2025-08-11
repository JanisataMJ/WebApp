package analysisResult

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

// GET /analysis-results
func ListAnalysisResults(c *gin.Context) {
	var results []entity.AnalysisResult

	// โหลดข้อมูลพร้อม preload User และ HealthDataList
	if err := config.DB().
		Preload("User").
		Preload("HealthDataList").
		Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// กรองข้อมูลที่ไม่สมบูรณ์ (ถ้าต้องการ)
	var validResults []entity.AnalysisResult
	for _, res := range results {
		if res.Timestamp.IsZero() || res.AnalysisType == "" {
			continue
		}
		validResults = append(validResults, res)
	}

	c.JSON(http.StatusOK, validResults)
}

// GET /analysis-results/:id
func GetAnalysisResult(c *gin.Context) {
	id := c.Param("id")

	// แปลง id ให้เป็น uint
	resultID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var result entity.AnalysisResult

	if err := config.DB().
		Preload("User").
		Preload("HealthDataList").
		First(&result, resultID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "AnalysisResult not found"})
		return
	}

	c.JSON(http.StatusOK, result)
}
