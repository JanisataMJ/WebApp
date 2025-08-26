package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/JanisataMJ/WebApp/config"

	calendar "github.com/JanisataMJ/WebApp/controller/Calendar"
    "github.com/JanisataMJ/WebApp/controller/gender"
	"github.com/JanisataMJ/WebApp/controller/healthSummary"
    "github.com/JanisataMJ/WebApp/controller/healthAnalysis"
	"github.com/JanisataMJ/WebApp/controller/healthData"
	"github.com/JanisataMJ/WebApp/controller/notification"
	"github.com/JanisataMJ/WebApp/controller/smartwatchDevice"
    "github.com/JanisataMJ/WebApp/services"

	"github.com/JanisataMJ/WebApp/controller/user"

	"github.com/JanisataMJ/WebApp/middlewares"

    "log"
    "os"
    "github.com/joho/godotenv"
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

   r := gin.Default()

   r.Use(CORSMiddleware())

   // Auth Route
   r.POST("/signup", users.SignUp)
   r.POST("/signin", users.SignIn)

   router := r.Group("/")
   {
       router.Use(middlewares.Authorizes())

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
        router.POST("/send-notifications", func(c *gin.Context) {
            go services.SendPendingNotifications()
            c.JSON(200, gin.H{"message": "Notifications sending started"})
        })

        //healthSummary Route
        router.GET("/list-healthSummary", healthSummary.ListHealthSummary)
        router.GET("/healthSummary/:id", healthSummary.GetHealthSummary)

        //healthAnalysis Route
        router.GET("/list-healthAnalysis", healthAnalysis.ListHealthAnalysis)
        router.GET("/healthAnalysis/:id", healthAnalysis.GetHealthAnalysis)

        //HealthData Route
        router.GET("/list-healthData", healthData.ListHealthData)
        router.GET("/healthData/:id", healthData.GetHealthDataByUserID)

        //SmartwatchDevice Route
        router.POST("/create-smartwatch/:id", smartwatchDevice.CreateSmartwatchDevice)
        router.GET("/smartwatch/:id", smartwatchDevice.GetSmartwatchDevice)
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
       c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

       if c.Request.Method == "OPTIONS" {
           c.AbortWithStatus(204)
           return
       }
       c.Next()
   }
}