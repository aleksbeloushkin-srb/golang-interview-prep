package main

import "fmt"

type Notifier struct{}

func (Notifier) Channel() string { return "email" }

func (n Notifier) Send(msg string) string { return n.Channel() + ": " + msg }

type SMS struct{ Notifier }

func (SMS) Channel() string { return "sms" }

type Sender interface{ Send(msg string) string }

func main() {
	s := SMS{}
	var snd Sender = s
	fmt.Println(s.Channel())
	fmt.Println(s.Send("paid"))
	fmt.Println(snd.Send("paid"))
}
