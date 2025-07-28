package calendar

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

func ListCalendar(c *gin.Context) {
	var calendars []entity.MoodData

	if err := config.DB().Preload("User").Find(&calendars).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	return
	}


	var validCalendars []entity.MoodData
	for _, calendar := range calendars {

		if calendar.CalendarDate.IsZero() || calendar.Title == "" {
			continue
		}
		validCalendars = append(validCalendars, calendar)
	}


	c.JSON(http.StatusOK, validCalendars)
}

func CreateCalendar(c *gin.Context) {
	var input entity.MoodData


	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	/*if input.EmployeeID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EmployeeID is required"})
		return
	}*/

	if input.CalendarDate.IsZero() {
		input.CalendarDate = time.Now() 
	}


	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load timezone"})
		return
	}


	input.CalendarDate = input.CalendarDate.In(loc)


	if input.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
		return
	}
	
	if len(input.Title) < 1 || len(input.Title) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title must be between 1 and 100 characters"})
		return
	}


	if err := config.DB().Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

func DeleteCalendar(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB().Delete(&entity.MoodData{}, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Calendar not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Calendar deleted successfully"})
}
