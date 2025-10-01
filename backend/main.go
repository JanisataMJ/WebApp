package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/JanisataMJ/WebApp/config"
	// ✅ เปลี่ยน Alias: admin_count
	adminCount "github.com/JanisataMJ/WebApp/controller/admin_count"
	"github.com/JanisataMJ/WebApp/controller/article"
	// ✅ เปลี่ยน Alias: gender
	gender "github.com/JanisataMJ/WebApp/controller/gender"
	"github.com/JanisataMJ/WebApp/controller/gmail"
	"github.com/JanisataMJ/WebApp/entity"
	"github.com/JanisataMJ/WebApp/controller/healthAnalysis"
	"github.com/JanisataMJ/WebApp/controller/healthData"
	"github.com/JanisataMJ/WebApp/controller/healthSummary"
	"github.com/JanisataMJ/WebApp/controller/notification"
	"github.com/JanisataMJ/WebApp/controller/smartwatchDevice"
	// ✅ เปลี่ยน Alias: user
	user "github.com/JanisataMJ/WebApp/controller/user"
	"github.com/JanisataMJ/WebApp/middlewares"
	"github.com/JanisataMJ/WebApp/seed"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"

)

const PORT = "8000"

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	emailUser := os.Getenv("EMAIL_USER")
	emailPass := os.Getenv("EMAIL_PASS")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	log.Println("Email User:", emailUser)
	log.Println("Email Pass:", emailPass)
	log.Println("SMTP Host:", smtpHost, "Port:", smtpPort)

	config.ConnectionDB()
	gormDB := config.DB()
	config.SetupDatabase()

	//seed.SeedHealthData(gormDB)
	seed.SeedHealthDataTwoWeeks(gormDB)

	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("Failed to get *sql.DB from GORM: %v", err)
	}

	// 💡 การแก้ไขที่สำคัญ: ต้องใช้ SetupConfigTable เวอร์ชันที่รองรับหลายชีท
	if err := healthData.SetupConfigTable(sqlDB); err != nil {
		log.Fatalf("Failed to setup config table: %v", err)
	}

	// Initial import: เรียกใช้ ImportSheetData สำหรับแต่ละชีท
	// 🚩 ImportSheetData ถูกสร้างขึ้นเพื่อแทนที่ ImportHealthData เดิม
	log.Println("▶️ Starting initial data import for HealthData_Daily...")
	healthData.ImportSheetData(sqlDB, "HealthData_Daily")

	log.Println("▶️ Starting initial data import for HealthData_LatestAll...")
	healthData.ImportSheetData(sqlDB, "HealthData_LatestAll")
	// ----------------------------------------------------

	log.Println("▶️ Starting initial Health Analysis...")
	healthAnalysis.AnalyzeHealthData(gormDB) // 💡 เรียกใช้ Analysis หลัง Import
	log.Println("✅ Initial Health Analysis completed.")

	// ----------------------------------------------------
	// 🚩 การเรียกใช้ Backfill Summary
	// ----------------------------------------------------
	log.Println("▶️ Starting FULL BACKFILL Summary Job...")
	healthSummary.RunSummaryJob(gormDB, true)
	log.Println("✅ FULL BACKFILL Summary Job completed.")
	// ----------------------------------------------------

	// Start data import job (จะเรียกใช้ ImportSheetData สองครั้งซ้ำๆ)
	// 💡 ต้องแน่ใจว่า healthData.StartDataImportJob ถูกแก้ไขให้เรียก ImportSheetData()
	go healthData.StartDataImportJob(sqlDB)

	// Gin framework setup
	r := gin.Default()
	r.Use(CORSMiddleware())
	r.Use(middlewares.DBMiddleware(config.DB()))

	// Define routes...
	r.POST("/signup", user.SignUp)            // ใช้ Alias 'user'
	r.POST("/signin", user.SignIn)            // ใช้ Alias 'user'
	r.POST("/create-admin", user.CreateAdmin) // ใช้ Alias 'user'

	router := r.Group("/")
	{
		router.Use(middlewares.Authorizes())
		r.Static("/uploads", "./uploads")
		router.PUT("/user/:id", user.Update)    // ใช้ Alias 'user'
		router.GET("/users", user.GetAll)       // ใช้ Alias 'user'
		router.GET("/user/:id", user.Get)       // ใช้ Alias 'user'
		router.DELETE("/user/:id", user.Delete) // ใช้ Alias 'user'
		router.POST("/create-notification/:id", notification.CreateNotification)
		router.GET("/notification/:id", notification.GetNotificationsByUserID)
		router.PATCH("/notification/:id/status", notification.UpdateNotificationStatusByID)
		router.GET("/run-weekly-analysis/:userID", func(c *gin.Context) { // เปลี่ยนชื่อ Endpoint ให้สื่อความหมาย
			id, err := strconv.ParseUint(c.Param("userID"), 10, 32)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
				return
			}
			go func() {
				// รันการวิเคราะห์รายสัปดาห์ด้วย Logic ใหม่
				healthAnalysis.RunWeeklyAnalysisForSingleUser(context.Background(), uint(id))
			}()
			c.JSON(200, gin.H{"message": "Weekly analysis process started", "userID": id})
		})
		router.POST("/check-realtime-alert", gmail.SendRealtimeAlert)
		router.POST("/create-article/:id", article.CreateArticle)
		router.GET("/list-article", article.ListArticles)
		router.GET("/article/:id", article.GetArticleByID)
		router.PUT("/update-article/:id", article.UpdateArticle)
		router.DELETE("/delete-article/:id", article.DeleteArticle)
		router.PUT("/article/:id/publishArticleNow", article.PublishArticleNow)
		router.PUT("/article/:id/unpublishArticle", article.UnpublishArticle)
		router.GET("/list-healthSummary", healthSummary.ListHealthSummary)
		router.GET("/healthSummary/:id", healthSummary.GetHealthSummary)
		router.GET("/healthSummary/weekly/:id", healthSummary.GetWeeklySummary)
		router.GET("/list-healthAnalysis", healthAnalysis.ListHealthAnalysis)
		router.GET("/healthAnalysis/:id", healthAnalysis.GetHealthAnalysis)
		router.GET("/sleep-analysis/:id", healthAnalysis.GetSleepAnalysisByUser)
		router.POST("/analyze-with-gemini/:userID", healthAnalysis.AnalyzeWithGeminiHandler)
		router.POST("/health-data", healthAnalysis.SaveHealthDataHandler)
		router.GET("/list-healthData", healthData.ListHealthData)
		router.GET("/healthData/:id", healthData.GetHealthDataByUserID)
		router.GET("/healthData/weekly/:id", healthData.GetWeeklyHealthData)
		router.GET("/daily-heart-rate", healthData.GetDailyHeartRate)
		router.GET("/daily-steps", healthData.GetDailySteps)
		router.GET("/daily-calories", healthData.GetDailyCalories)
		router.GET("/daily-spo2", healthData.GetDailySpo2)
		router.GET("/daily-sleep", healthData.GetDailySleep)
		router.POST("/create-smartwatch/:id", smartwatchDevice.CreateSmartwatchDevice)
		router.GET("/smartwatch/:id", smartwatchDevice.GetSmartwatchDevice)
		router.GET("/admin-counts", adminCount.GetAdminCounts) // ใช้ Alias 'adminCount'
	}

	r.GET("/genders", gender.GetAll) // ใช้ Alias 'gender'
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	 // 🚩 [แก้ไข] เริ่มต้น Real-time Health Monitoring สำหรับผู้ใช้ทั้งหมด
    log.Println("▶️ Starting Realtime Health Monitoring Job...")
    
    var usersToMonitor []entity.User
    // ดึงผู้ใช้ทั้งหมดที่ต้องการให้ตรวจสอบ (อาจจะกรองด้วย RoleID หรือเงื่อนไขอื่น ๆ ได้)
    if err := gormDB.Find(&usersToMonitor).Error; err != nil {
        log.Fatalf("Failed to fetch users for monitoring: %v", err)
    }

    // กำหนดรอบเวลาตรวจสอบ (เช่น ทุก 60 วินาที)
    const monitorIntervalSeconds = 60 
    
    for _, user := range usersToMonitor {
        log.Printf("Starting monitoring goroutine for User ID: %d, Interval: %d seconds\n", user.ID, monitorIntervalSeconds)
        // เริ่ม Goroutine สำหรับผู้ใช้แต่ละคน
        go healthAnalysis.StartUserRealtimeAlertMonitoring(user.ID, monitorIntervalSeconds)
    }
    log.Println("✅ Realtime Health Monitoring started.")

    // ---------------------------------------------------------------------------------------

	//go healthAnalysis.CheckForCriticalAlerts(context.Background())
	go healthAnalysis.WeeklyAnalysisJob(context.Background())
	r.Run("localhost:" + PORT)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
