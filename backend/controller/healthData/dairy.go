package healthData

import (
	"gorm.io/gorm"
	"log"
	"net/http"
	"time"

	"github.com/JanisataMJ/WebApp/entity"
	"github.com/gin-gonic/gin"
)

// 🔹 ฟังก์ชันหลัก ใช้ร่วมกันทุก metric
func getDailyMetric(c *gin.Context, field string, alias string) {
	db := c.MustGet("db").(*gorm.DB)
	userID := c.Query("userID")
	withStats := c.DefaultQuery("withStats", "false")

	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userID is required"})
		return
	}

	loc, _ := time.LoadLocation("Asia/Bangkok")
	var start, end time.Time

	if field == "SleepHours" {
		// ✅ กรณี SleepHours: คิดช่วง 18:00 ของเมื่อวาน → ปัจจุบัน (ไม่แก้ไขตามที่คุณต้องการ)
		now := time.Now().In(loc)
		yesterday := now.AddDate(0, 0, -1).Truncate(24 * time.Hour)

		start = yesterday.Add(18 * time.Hour)
		end = now // สิ้นสุดที่เวลาปัจจุบัน
	} else {
		// ✅ Metric ปกติ: วันนี้ตั้งแต่ 00:00 → สิ้นวัน (23:59:59)
		now := time.Now().In(loc)
		start = now.Truncate(24 * time.Hour) // 00:00:00 ของวันนี้
		// กำหนดให้ end เป็น 23:59:59 ของวันนี้ (คือ 00:00:00 ของวันถัดไป - 1 nanosecond)
		end = start.AddDate(0, 0, 1).Add(-time.Nanosecond)
	}

	// แปลงเป็น UTC ก่อน query DB
	startUTC := start.UTC()
	endUTC := end.UTC()

	var healthData []entity.HealthData
	var err error

	// 🔹 Query ข้อมูล
	if field == "SleepHours" {
		// เดิม: มี filter sleep_hours <> ''
		err = db.Where("user_id = ? AND timestamp >= ? AND timestamp < ?",
			userID, startUTC, endUTC).
			Order("timestamp ASC").
			Find(&healthData).Error
	} else {
		err = db.Where("user_id = ? AND timestamp >= ? AND timestamp <= ?",
			userID, startUTC, endUTC).
			Order("timestamp ASC").
			Find(&healthData).Error
	}

	if err != nil {
		log.Println("Error fetching health data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Fetched %d records for userID=%s (field=%s, start=%s, end=%s)\n",
		len(healthData), userID, field, start, end)

	// 🔹 Map response + คำนวณสถิติ
	var response []map[string]interface{}
	var total float64
	var min, max float64

	for i, d := range healthData {
		var value interface{}
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
			value = d.SleepHours
		}

		response = append(response, map[string]interface{}{
			"time": d.Timestamp.Format("15:04"),
			alias:  value,
		})

		if field != "SleepHours" {
			numVal := value.(float64)
			total += numVal
			if i == 0 || numVal < min {
				min = numVal
			}
			if i == 0 || numVal > max {
				max = numVal
			}
		}
	}

	// 🔹 สร้างผลลัพธ์ JSON
	result := gin.H{
		"date": start.Format("2006-01-02"),
		"data": response,
	}

	if withStats == "true" && len(healthData) > 0 && field != "SleepHours" {
		avg := total / float64(len(healthData))
		result["stats"] = gin.H{
			"avg": avg,
			"min": min,
			"max": max,
		}
	}

	c.JSON(http.StatusOK, result)
}

// 🔹 API Endpoint ย่อย
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