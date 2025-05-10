package main

import (
	"log"
	"net/http"

	"github.com/utibori-jp/yojitsu-tracker/internal/application/service"
	"github.com/utibori-jp/yojitsu-tracker/internal/handler"
	"github.com/utibori-jp/yojitsu-tracker/internal/infra/router"
)

func main() {
	port := "8080"

	todoSvc := services.NewTodoService()

	todoAPIServer := handler.NewServer(todoSvc)

	httpRouter := router.NewRouter(todoAPIServer)

	log.Printf("Starting server on :%s", port)
	if err := http.ListenAndServe(":"+port, httpRouter); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}
