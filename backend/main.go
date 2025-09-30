package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"fmt"
	"time"
	"strconv"

	"github.com/JanisataMJ/WebApp/config"
	// 💡 แก้ไข Alias: count เป็น admin_count
	adminCount "github.com/JanisataMJ/WebApp/controller/admin_count"
	"github.com/JanisataMJ/WebApp/controller/article"
	// 💡 แก้ไข Alias: genders เป็น gender
	"github.com/JanisataMJ/WebApp/controller/gender"
	"github.com/JanisataMJ/WebApp/controller/gmail"
	"github.com/JanisataMJ/WebApp/controller/healthAnalysis"
	"github.com/JanisataMJ/WebApp/controller/healthData"
	"github.com/JanisataMJ/WebApp/controller/healthSummary"
	"github.com/JanisataMJ/WebApp/controller/notification"
	"github.com/JanisataMJ/WebApp/controller/smartwatchDevice"
	// 💡 แก้ไข Alias: users เป็น user
	user "github.com/JanisataMJ/WebApp/controller/user"
	"github.com/JanisataMJ/WebApp/entity"
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

// SSE clients map per user
var sseClients = make(map[uint][]chan entity.Notification)

// Helper: convert notification to JSON
func notifToJSON(n entity.Notification) string {
	b, _ := json.Marshal(n)
	return string(b)
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

	//*** เรียกใช้ Backfill Health Analysis ที่นี่ ***
	//healthAnalysis.BackfillHealthAnalysis(gormDB)

	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("Failed to get *sql.DB from GORM: %v", err)
	}

	// *** เรียกใช้ Setup และ Import จาก Controller ใหม่ ***
	if err := healthData.SetupConfigTable(sqlDB); err != nil {
		log.Fatalf("Failed to setup config table: %v", err)
	}

	// Initial import
	healthData.ImportHealthData(sqlDB)
	// ----------------------------------------------------
	// ✅ ตำแหน่งที่ควรเรียกใช้ AnalyzeHealthData
	// ----------------------------------------------------
	log.Println("▶️ Starting initial Health Analysis...")
	healthAnalysis.AnalyzeHealthData(gormDB) // 💡 ต้องเรียกใช้ตรงนี้!
	log.Println("✅ Initial Health Analysis completed.")

	// ----------------------------------------------------
	// 🚩 การเรียกใช้ Backfill Summary (รันเพียงครั้งเดียวเมื่อต้องการสร้างย้อนหลัง)
	// ----------------------------------------------------
	log.Println("▶️ Starting FULL BACKFILL Summary Job...")
	// ตั้งค่า isBackfill เป็น true เพื่อให้สร้าง Summary ย้อนหลังทุกสัปดาห์
	healthSummary.RunSummaryJob(gormDB, true)
	log.Println("✅ FULL BACKFILL Summary Job completed.")
	// ----------------------------------------------------

	// Start data import job
	go healthData.StartDataImportJob(sqlDB)

	// Gin framework setup
	r := gin.Default()
	r.Use(CORSMiddleware())
	r.Use(middlewares.DBMiddleware(config.DB()))

	healthController := notification.HealthAlertController{DB: config.DB()}

	// Define routes...
	r.POST("/signup", user.SignUp)
	r.POST("/signin", user.SignIn)
	r.POST("/create-admin", user.CreateAdmin)

	router := r.Group("/")
	{
		router.Use(middlewares.Authorizes())
		r.Static("/uploads", "./uploads")
		router.PUT("/user/:id", user.Update)
		router.GET("/users", user.GetAll)
		router.GET("/user/:id", user.Get)
		router.DELETE("/user/:id", user.Delete)
		router.POST("/create-notification/:id", notification.CreateNotification)
		router.GET("/notification/:id", notification.GetNotificationsByUserID)
		router.PATCH("/notification/:id/status", notification.UpdateNotificationStatusByID)
		router.GET("/send-weekly-summary/:userID", func(c *gin.Context) {
			id, _ := strconv.Atoi(c.Param("userID"))
			go gmail.SendWeeklySummary(config.DB(), uint(id))
			c.JSON(200, gin.H{"message": "Weekly summary email process started", "userID": id})
		})

		router.GET("/health/check/:userID", healthController.CheckHealth)

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
		router.GET("/admin-counts", adminCount.GetAdminCounts)

		router.GET("/notification/sse/:userID", func(c *gin.Context) {
			userIDStr := c.Param("userID")
			userID, err := strconv.Atoi(userIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
				return
			}

			c.Writer.Header().Set("Content-Type", "text/event-stream")
			c.Writer.Header().Set("Cache-Control", "no-cache")
			c.Writer.Header().Set("Connection", "keep-alive")

			messageChan := make(chan entity.Notification)
			sseClients[uint(userID)] = append(sseClients[uint(userID)], messageChan)

			notify := c.Writer.CloseNotify()
			go func() {
				<-notify
				clients := sseClients[uint(userID)]
				for i, ch := range clients {
					if ch == messageChan {
						sseClients[uint(userID)] = append(clients[:i], clients[i+1:]...)
						break
					}
				}
			}()

			for {
				select {
				case notif := <-messageChan:
					fmt.Fprintf(c.Writer, "data: %s\n\n", notifToJSON(notif))
					c.Writer.Flush()
				case <-time.After(time.Minute * 5):
					// Ping to keep connection alive
					fmt.Fprintf(c.Writer, ": ping\n\n")
					c.Writer.Flush()
				}
			}
		})
	}

	r.GET("/genders", genders.GetAll)
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	// หลังจาก validate password และ generate token แล้ว
	//go healthAnalysis.CheckForCriticalAlerts(context.Background(), dbUser.ID)
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
