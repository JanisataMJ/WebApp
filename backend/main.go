package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/JanisataMJ/WebApp/config"

	calendar "github.com/JanisataMJ/WebApp/controller/Calendar"
	"github.com/JanisataMJ/WebApp/controller/admin_count"
	"github.com/JanisataMJ/WebApp/controller/article"
	"github.com/JanisataMJ/WebApp/controller/gender"
	"github.com/JanisataMJ/WebApp/controller/healthAnalysis"
	"github.com/JanisataMJ/WebApp/controller/healthData"
	"github.com/JanisataMJ/WebApp/controller/healthSummary"
	"github.com/JanisataMJ/WebApp/controller/notification"
	"github.com/JanisataMJ/WebApp/controller/smartwatchDevice"
	"github.com/JanisataMJ/WebApp/controller/email"

	"github.com/JanisataMJ/WebApp/controller/user"

	"github.com/JanisataMJ/WebApp/middlewares"

	"log"
	"os"

	"github.com/joho/godotenv"

	"github.com/JanisataMJ/WebApp/seed" //ข้อมูลตัวอย่าง
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
	log.Println("Email Pass:", emailPass) // แค่ทดสอบ (จริง ๆ ไม่ควร log password)
	log.Println("SMTP Host:", smtpHost, "Port:", smtpPort)

	// open connection database
	config.ConnectionDB()

	// Generate databases
	config.SetupDatabase()

	// Seed ข้อมูล HealthData //////////////////////////////////////
    seed.SeedHealthData(config.DB())
	//////////////////////////////////////////////////////////////

	r := gin.Default()
	r.Use(CORSMiddleware())

	// ✅ Middleware ใส่ DB ลง context
	r.Use(middlewares.DBMiddleware(config.DB()))


	// Auth Route
	r.POST("/signup", users.SignUp)
	r.POST("/signin", users.SignIn)
	r.POST("/create-admin", users.CreateAdmin)

	r.GET("/send-test-email/:userID", func(c *gin.Context) {
		userID := c.Param("userID")
		email.SendWeeklySummary(c) // หรือ SendRealtimeAlert แล้วแต่กรณี
		c.JSON(200, gin.H{"message": "Test email triggered for user " + userID})
	})
	    
	router := r.Group("/")
	{
		router.Use(middlewares.Authorizes())

		r.Static("/uploads", "./uploads")

		// User Route
		router.PUT("/user/:id", users.Update)
		router.GET("/users", users.GetAll)
		router.GET("/user/:id", users.Get)
		router.DELETE("/user/:id", users.Delete)

		//Calendar Route
		router.GET("/calendar", calendar.ListCalendar)
		router.POST("/create-calendar", calendar.CreateCalendar)
		router.DELETE("/delete-calendar/:id", calendar.DeleteCalendar)

		//Notification Route
		router.POST("/create-notification/:id", notification.CreateNotification)
		router.GET("/notification/:id", notification.GetNotificationsByUserID)
    	router.PATCH("/notification/:id/status", notification.UpdateNotificationStatusByID)

		// Email Route
		router.GET("/send-weekly-summary", email.SendWeeklySummary)
		router.POST("/check-realtime-alert", email.SendRealtimeAlert)
	

		//Article Route
		router.POST("/create-article/:id", article.CreateArticle)
		router.GET("/list-article", article.ListArticles)
		router.GET("/article/:id", article.GetArticleByID)
		router.PUT("/update-article/:id", article.UpdateArticle)
		router.DELETE("/delete-article/:id", article.DeleteArticle)

		router.PUT("/order-articles", article.UpdateArticleOrder)
		router.PUT("/article/:id/publishArticleNow", article.PublishArticleNow)
		router.PUT("/article/:id/unpublishArticle", article.UnpublishArticle)

		//healthSummary Route
		router.GET("/list-healthSummary", healthSummary.ListHealthSummary)
		router.GET("/healthSummary/:id", healthSummary.GetHealthSummary)

		//healthAnalysis Route
		router.GET("/list-healthAnalysis", healthAnalysis.ListHealthAnalysis)
		router.GET("/healthAnalysis/:id", healthAnalysis.GetHealthAnalysis)

		//HealthData Route
		router.GET("/list-healthData", healthData.ListHealthData)
		router.GET("/healthData/:id", healthData.GetHealthDataByUserID)

		// Daily APIs
		router.GET("/daily-heart-rate", healthData.GetDailyHeartRate)
		router.GET("/daily-steps", healthData.GetDailySteps)
		router.GET("/daily-calories", healthData.GetDailyCalories)
		router.GET("/daily-spo2", healthData.GetDailySpo2)
		router.GET("/daily-sleep", healthData.GetDailySleep)

		//SmartwatchDevice Route
		router.POST("/create-smartwatch/:id", smartwatchDevice.CreateSmartwatchDevice)
		router.GET("/smartwatch/:id", smartwatchDevice.GetSmartwatchDevice)

		//Count Route
		router.GET("/admin-counts", count.GetAdminCounts)
	}

	r.GET("/genders", genders.GetAll)

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	// Run the server
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
