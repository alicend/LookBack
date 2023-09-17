package controllers

import (
	"gorm.io/gorm"
)

type MailSender interface {
	SendSignUpMail(email string) error
}

type ProductionMailSender struct{}

type MockMailSender struct {
	MockSendSignUpMail func(email string) error
}

type Handler struct {
	DB *gorm.DB
	MailSender MailSender
}