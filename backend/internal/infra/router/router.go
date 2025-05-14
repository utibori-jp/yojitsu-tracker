package router

import (
	"log"

	api "github.com/utibori-jp/yojitsu-tracker/internal/generated"
	"github.com/utibori-jp/yojitsu-tracker/internal/handler"

	"github.com/go-chi/chi/v5"
	mw "github.com/go-chi/chi/v5/middleware"
	oapiMw "github.com/oapi-codegen/nethttp-middleware"
)

// NewRouter creates and configures a new chi router.
func NewRouter(server *handler.Server) *chi.Mux {
	// Initialize a new chi router.
	r := chi.NewRouter()

	// Get Swagger Object for OpenAPI request validation.
	swagger, err := api.GetSwagger()
	if err != nil {
		log.Fatalf("Error loading swagger spec: %s", err)
	}

	// Apply middleware to the router.
	r.Use(mw.RequestID) // Injects a request ID into the context of each request.
	r.Use(mw.RealIP)    // Sets the RemoteAddr to the X-Forwarded-For or X-Real-IP header.
	r.Use(mw.Logger)    // Logs the start and end of each request with the path, method, status, and duration.
	r.Use(mw.Recoverer) // Recovers from panics and returns a 500 error.
	// TODO: Enable StripSlashes. Currently, it conflicts with OpenAPI request validation.
	// r.Use(mw.StripSlashes)
	r.Use(oapiMw.OapiRequestValidator(swagger)) // Validates incoming requests against the OpenAPI 3 specification.

	// Register the API handlers.
	api.HandlerWithOptions(server, api.ChiServerOptions{
		BaseRouter: r,
		BaseURL:    "/api", // Defines the base path for all API endpoints.
	})

	return r
}
