package seed

import (
	"math/rand"
	"time"
	"fmt"

	"gorm.io/gorm"
	"github.com/JanisataMJ/WebApp/entity"
)

/*func SeedHealthData(db *gorm.DB) {
	userID := uint(1)

	now := time.Now().Truncate(24 * time.Hour)
	data := []entity.HealthData{}

	rand.Seed(time.Now().UnixNano())

	for hour := 0; hour < 24; hour++ {
		d := entity.HealthData{
			Timestamp:      now.Add(time.Duration(hour) * time.Hour),
			Bpm:            uint(50 + rand.Intn(40)),
			Steps:          int64(100 + rand.Intn(500)),
			CaloriesBurned: 40 + rand.Float64()*30,
			Spo2:           95 + float64(rand.Intn(4)),
			SleepHours:     "0",
			UserID:         userID,
		}

		if hour >= 0 && hour < 6 {
			d.Bpm = uint(50 + rand.Intn(10))
			d.Steps = 0
			d.Spo2 = 96
			d.SleepHours = "1"
		}

		data = append(data, d)
	}

	db.Create(&data)
}*/

func SeedHealthData(db *gorm.DB) {
	// ---------------------------
	// Risk Levels
	// ---------------------------
	var lGood, lNormal, lBad entity.RiskLevel
	Rlevels := []entity.RiskLevel{
		{Rlevel: "ดี"},
		{Rlevel: "ปกติ"},
		{Rlevel: "เสี่ยง"},
	}
	for i, level := range Rlevels {
		db.FirstOrCreate(&Rlevels[i], entity.RiskLevel{Rlevel: level.Rlevel})
	}
	lGood = Rlevels[0]
	lNormal = Rlevels[1]
	lBad = Rlevels[2]

	// ---------------------------
	// HealthData + HealthAnalysis
	// ---------------------------
	userID := uint(1)
	now := time.Now().Truncate(24 * time.Hour)
	rand.Seed(time.Now().UnixNano())

	for hour := 0; hour < 24; hour++ {
		hd := entity.HealthData{
			Timestamp:      now.Add(time.Duration(hour) * time.Hour),
			Bpm:            uint(60 + rand.Intn(40)),
			Steps:          int64(500 + rand.Intn(2000)),
			CaloriesBurned: 100 + rand.Float64()*50,
			Spo2:           95 + float64(rand.Intn(4)),
			SleepHours:     "0",
			UserID:         userID,
		}

		if hour >= 0 && hour < 6 {
			hd.Bpm = uint(50 + rand.Intn(10))
			hd.Steps = 0
			hd.Spo2 = 96
			hd.SleepHours = fmt.Sprintf("%d h.", hour+1)
		}

		db.Create(&hd)

		analyses := []entity.HealthAnalysis{
			{
				Category:       "อัตราการเต้นหัวใจ",
				Value:          fmt.Sprintf("%d bpm", hd.Bpm),
				Interpretation: interpretHeartRate(hd.Bpm),
				Suggestion:     suggestHeartRate(hd.Bpm),
				RiskLevelID:    mapRiskLevelHeartRate(hd.Bpm, lGood, lNormal, lBad),
				HealthDataID:   hd.ID,
			},
			{
				Category:       "จำนวนก้าว",
				Value:          fmt.Sprintf("%d ก้าว", hd.Steps),
				Interpretation: interpretSteps(hd.Steps),
				Suggestion:     suggestSteps(hd.Steps),
				RiskLevelID:    mapRiskLevelSteps(hd.Steps, lGood, lNormal, lBad),
				HealthDataID:   hd.ID,
			},
			{
				Category:       "การนอนหลับ",
				Value:          hd.SleepHours,
				Interpretation: interpretSleep(hd.SleepHours),
				Suggestion:     suggestSleep(hd.SleepHours),
				RiskLevelID:    lNormal.ID,
				HealthDataID:   hd.ID,
			},
			{
				Category:       "พลังงานที่ใช้ไป",
				Value:          fmt.Sprintf("%.2f kcal", hd.CaloriesBurned),
				Interpretation: interpretCalories(hd.CaloriesBurned),
				Suggestion:     suggestCalories(hd.CaloriesBurned),
				RiskLevelID:    mapRiskLevelCalories(hd.CaloriesBurned, lGood, lNormal, lBad),
				HealthDataID:   hd.ID,
			},
			{
				Category:       "ออกซิเจนในเลือด",
				Value:          fmt.Sprintf("%.0f %%", hd.Spo2),
				Interpretation: interpretSpo2(hd.Spo2),
				Suggestion:     suggestSpo2(hd.Spo2),
				RiskLevelID:    mapRiskLevelSpo2(hd.Spo2, lGood, lNormal, lBad),
				HealthDataID:   hd.ID,
			},
		}

		db.Create(&analyses)
	}
}

// ---------------------------
// RiskLevel Mapping Functions
// ---------------------------

func mapRiskLevelHeartRate(bpm uint, lGood, lNormal, lBad entity.RiskLevel) uint {
	if bpm < 60 {
		return lBad.ID
	} else if bpm <= 100 {
		return lNormal.ID
	}
	return lBad.ID
}

func mapRiskLevelSteps(steps int64, lGood, lNormal, lBad entity.RiskLevel) uint {
	if steps < 5000 {
		return lBad.ID
	} else if steps < 10000 {
		return lNormal.ID
	}
	return lGood.ID
}

func mapRiskLevelCalories(calories float64, lGood, lNormal, lBad entity.RiskLevel) uint {
	if calories < 200 {
		return lBad.ID
	} else if calories < 400 {
		return lNormal.ID
	}
	return lGood.ID
}

func mapRiskLevelSpo2(spo2 float64, lGood, lNormal, lBad entity.RiskLevel) uint {
	if spo2 < 95 {
		return lBad.ID
	} else if spo2 <= 98 {
		return lNormal.ID
	}
	return lGood.ID
}

func mapRiskLevelBodyTemp(temp float64, lGood, lNormal, lBad entity.RiskLevel) uint {
	if temp < 36.0 || temp > 37.5 {
		return lBad.ID
	}
	return lNormal.ID
}

// ---------------------------
// Helper Functions
// ---------------------------

func interpretHeartRate(bpm uint) string {
	if bpm < 60 {
		return "หัวใจเต้นช้า"
	} else if bpm <= 100 {
		return "ปกติ"
	}
	return "หัวใจเต้นเร็ว"
}

func suggestHeartRate(bpm uint) string {
	if bpm < 60 {
		return "ควรตรวจสุขภาพเพิ่มเติม"
	} else if bpm <= 100 {
		return "อัตราการเต้นหัวใจปกติดี"
	}
	return "ควรพักผ่อนและลดความเครียด"
}

func interpretSteps(steps int64) string {
	if steps < 5000 {
		return "เดินน้อย"
	} else if steps < 10000 {
		return "พอใช้"
	}
	return "เดินครบเป้าหมาย"
}

func suggestSteps(steps int64) string {
	if steps < 5000 {
		return "ควรเดินเพิ่ม"
	} else if steps < 10000 {
		return "ใกล้ครบเป้าหมายแล้ว"
	}
	return "วันนี้คุณทำได้ดีมาก"
}

func interpretSleep(sleep string) string {
	if sleep == "0" {
		return "ยังไม่ได้นอน"
	}
	return "นอนหลับ"
}

func suggestSleep(sleep string) string {
	if sleep == "0" {
		return "ควรนอนหลับพักผ่อนให้เพียงพอ"
	}
	return "การนอนหลับเหมาะสม"
}

func interpretCalories(calories float64) string {
	if calories < 200 {
		return "เผาผลาญพลังงานน้อย"
	}
	return "เผาผลาญพลังงานดี"
}

func suggestCalories(calories float64) string {
	if calories < 200 {
		return "ควรออกกำลังกายเพิ่ม"
	}
	return "อยู่ในเกณฑ์ที่ดี"
}

func interpretSpo2(spo2 float64) string {
	if spo2 < 95 {
		return "ค่าออกซิเจนต่ำ"
	}
	return "ปกติ"
}

func suggestSpo2(spo2 float64) string {
	if spo2 < 95 {
		return "ควรพบแพทย์"
	}
	return "อยู่ในเกณฑ์ที่ดี"
}

func interpretBodyTemp(temp float64) string {
	if temp < 36.0 {
		return "อุณหภูมิต่ำ"
	} else if temp <= 37.5 {
		return "ปกติ"
	}
	return "มีไข้"
}

func suggestBodyTemp(temp float64) string {
	if temp < 36.0 {
		return "ควรเพิ่มความอบอุ่นร่างกาย"
	} else if temp <= 37.5 {
		return "อยู่ในเกณฑ์ที่ดี"
	}
	return "ควรพักผ่อนและดื่มน้ำมากๆ"
}