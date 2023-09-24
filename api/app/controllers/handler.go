package controllers

import (
	"gorm.io/gorm"
)

type MailSender interface {
	SendSignUpMail(email string) error
	SendUpdateEmailMail(email string) error
	SendUpdatePasswordMail(email string) error
}

type ProductionMailSender struct{}

type MockMailSender struct {
	MockSendSignUpMail func(email string) error
	MockSendUpdateEmailMail func(email string) error
	MockSendUpdatePasswordMail func(email string) error
}

type Handler struct {
	DB *gorm.DB
	MailSender MailSender
}