package router

import (
	"net/http"

	api "github.com/utibori-jp/yojitsu-tracker/internal/generated"
	"github.com/utibori-jp/yojitsu-tracker/internal/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewRouter(server *handler.Server) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api", func(subrouter chi.Router) {
		api.HandlerWithOptions(server, api.ChiServerOptions{
			BaseRouter: subrouter,
			BaseURL: "",
		})
	})

	return r
}
