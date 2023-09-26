package controllers

import (
	"gorm.io/gorm"
)

type MailSender interface {
	SendSignUpMail(email string) error
	SendInviteMail(userInviteInput UserInviteInput) error
	SendUpdateEmailMail(email string) error
	SendUpdatePasswordMail(email string) error
}

type ProductionMailSender struct{}

type MockMailSender struct {
	MockSendSignUpMail func(email string) error
	MockSendInviteMail func(userInviteInput UserInviteInput) error
	MockSendUpdateEmailMail func(email string) error
	MockSendUpdatePasswordMail func(email string) error
}

type Handler struct {
	DB *gorm.DB
	MailSender MailSender
}