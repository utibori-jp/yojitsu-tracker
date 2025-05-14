package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/utibori-jp/yojitsu-tracker/ent"
	services "github.com/utibori-jp/yojitsu-tracker/internal/application/service"
	"github.com/utibori-jp/yojitsu-tracker/internal/handler"
	"github.com/utibori-jp/yojitsu-tracker/internal/infra/router"

	_ "github.com/lib/pq" // PostgreSQL driver, imported for its side effects (registering the driver)
)

func main() {
	// Define the port the server will listen on.
	port := "8080"

	// --- Database Configuration (PostgreSQL) ---
	// TODO: These should be configurable via environment variables in the future.
	dbHost := "database"     // Database host
	dbPort := "5432"         // Database port
	dbUser := "postgres"     // Database username
	dbPassword := "postgres" // Database password
	dbName := "db"           // Database name
	sslMode := "disable"     // SSL mode for the database connection

	// Construct the Data Source Name (DSN) for the PostgreSQL connection.
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName, sslMode)

	// Open a connection to the PostgreSQL database using Ent.
	client, err := ent.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	// Defer closing the database connection until the main function exits.
	defer client.Close()

	// Run the auto migration tool to create all schema resources.
	// in the database based on the Ent schema definitions.
	// This is typically done during application startup in development or as a separate migration step in production.
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	// --- Setup Application Layers (Service, Handler, Server) ---

	// Initialize the TodoService with the Ent client.
	// The service layer contains the business logic.
	todoSvc := services.NewTodoService(client)

	// Initialize the TodoHandler with the TodoService.
	// The handler layer is responsible for handling HTTP requests and responses.
	todoH := handler.NewTodoHandler(todoSvc)

	// Initialize the main Server, which aggregates all handlers.
	// This server struct will be used by the oapi-codegen generated router.
	server := handler.NewServer(todoH)

	// --- Router Setup ---
	// Create a new Chi router and configure it with middleware and API routes.
	r := router.NewRouter(server)

	// --- Log Registered Routes (for debugging/visibility) ---
	// Walk through the Chi router to log all registered routes and their methods.
	log.Println("Registered routes:")
	chi.Walk(r, func(method string, route string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
		log.Printf("[%s]: '%s'\n", method, route)
		return nil
	})

	// --- Start HTTP Server ---
	log.Printf("Starting server on :%s", port)
	// ListenAndServe starts an HTTP server with a given address and handler.
	// The handler is typically nil, which means to use DefaultServeMux.
	// Here, we use our configured Chi router 'r'.
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}
