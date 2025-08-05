package notification

import (
   "net/http"
   "time"

   "github.com/JanisataMJ/WebApp/config"
   "github.com/JanisataMJ/WebApp/entity"
   "github.com/gin-gonic/gin"
)

func CreateNotification(c *gin.Context) {
	var input struct {
		Message             string    `json:"message"`
		Timestamp           time.Time `json:"timestamp"`
		UserID              uint      `json:"user_id"`
		HealthTypeID        uint      `json:"health_type_id"`
		NotificationStatusID uint      `json:"notification_status_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	notification := entity.Notification{
		Message:             input.Message,
		Timestamp:           input.Timestamp,
		UserID:              input.UserID,
		HealthTypeID:        input.HealthTypeID,
		NotificationStatusID: input.NotificationStatusID,
	}

	db := config.DB()
	if err := db.Create(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Notification created", "notification": notification})
}

func GetNotificationsByUserID(c *gin.Context) {
	userID := c.Param("id")
	var notifications []entity.Notification
	db := config.DB()

	// Join กับตารางที่เกี่ยวข้อง เช่น User, HealthType, NotificationStatus
	result := db.Preload("User").
		Preload("HealthType").
		Preload("NotificationStatus").
		Where("user_id = ?", userID).
		Find(&notifications)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if len(notifications) == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}

	c.JSON(http.StatusOK, notifications)
}