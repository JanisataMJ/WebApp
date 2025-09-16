package healthData

import (
	"net/http"
	"time"
	"gorm.io/gorm"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/entity"
)


// 🔹 ฟังก์ชันหลักใช้ร่วมกัน
func getDailyMetric(c *gin.Context, field string, alias string) {
	db := c.MustGet("db").(*gorm.DB)
	userID := c.Query("userID")
	withStats := c.DefaultQuery("withStats", "false")

	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userID is required"})
		return
	}

	// วันนี้
	today := time.Now().Truncate(24 * time.Hour)
	tomorrow := today.Add(24 * time.Hour)

	var healthData []entity.HealthData
	err := db.Where("user_id = ? AND timestamp >= ? AND timestamp < ?", userID, today, tomorrow).
		Order("timestamp ASC").
		Find(&healthData).Error
	if err != nil {
		log.Println("Error fetching health data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Fetched %d healthData records for userID=%s\n", len(healthData), userID)

	var response []map[string]interface{}
	var total float64
	var min, max float64

	for i, d := range healthData {
		var value float64
		switch field {
		case "Bpm":
			value = float64(d.Bpm)
		case "Steps":
			value = float64(d.Steps)
		case "CaloriesBurned":
			value = d.CaloriesBurned
		case "Spo2":
			value = d.Spo2
		case "SleepHours":
			// สมมติ SleepHours เก็บเป็น string เช่น "7.5"
			if parsed, err := time.ParseDuration(d.SleepHours + "h"); err == nil {
				value = parsed.Hours()
			}
		}

		response = append(response, map[string]interface{}{
			"time":  d.Timestamp.Format("15:04"),
			alias:   value,
		})

		total += value
		if i == 0 || value < min {
			min = value
		}
		if i == 0 || value > max {
			max = value
		}
	}

	result := gin.H{
		"date": today.Format("2006-01-02"),
		"data": response,
	}

	// เพิ่ม stats ถ้าขอมา
	if withStats == "true" && len(healthData) > 0 {
		avg := total / float64(len(healthData))
		result["stats"] = gin.H{
			"avg": avg,
			"min": min,
			"max": max,
		}
	}

	c.JSON(http.StatusOK, result)
}

// 🔹 API ย่อยแต่ละแบบ
func GetDailyHeartRate(c *gin.Context) {
	getDailyMetric(c, "Bpm", "heartRate")
}

func GetDailySteps(c *gin.Context) {
	getDailyMetric(c, "Steps", "steps")
}

func GetDailyCalories(c *gin.Context) {
	getDailyMetric(c, "CaloriesBurned", "calories")
}

func GetDailySpo2(c *gin.Context) {
	getDailyMetric(c, "Spo2", "spo2")
}

func GetDailySleep(c *gin.Context) {
	getDailyMetric(c, "SleepHours", "sleepHours")
}