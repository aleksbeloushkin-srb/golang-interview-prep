package main

import "fmt"

// Channel is the step that varies; Notifier gets it as a field.
type Channel interface{ Name() string }

type Email struct{}

func (Email) Name() string { return "email" }

type SMS struct{}

func (SMS) Name() string { return "sms" }

type Notifier struct{ ch Channel }

// n.ch.Name() is a call through an interface, so it reaches the channel that was passed in.
func (n Notifier) Send(msg string) string { return n.ch.Name() + ": " + msg }

func main() {
	fmt.Println(Notifier{ch: SMS{}}.Send("paid"))
	fmt.Println(Notifier{ch: Email{}}.Send("paid"))
}
