package healthData

import (
	"net/http"

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

// GET /health-data/:id
/*func GetHealthData(c *gin.Context) {
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
}*/