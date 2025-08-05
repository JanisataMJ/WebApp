package genders

import (
   "net/http"
   "github.com/JanisataMJ/WebApp/config"
   "github.com/JanisataMJ/WebApp/entity"
   "github.com/gin-gonic/gin"
)

func GetAll(c *gin.Context) {
   db := config.DB()
   var genders []entity.Gender
   db.Find(&genders)
   c.JSON(http.StatusOK, &genders)
}