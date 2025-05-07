package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	api "github.com/utibori-jp/yojitsu-tracker/internal/generated"
	"github.com/utibori-jp/yojitsu-tracker/internal/application/service"
)

type Server struct {
	todoService *services.TodoService
}

func NewServer(todoService *services.TodoService) *Server {
	return &Server{
		todoService: todoService,
	}
}

// ListTodos handles GET /todos requests.
func (s *Server) ListTodos(w http.ResponseWriter, r *http.Request) {
	todos, err := s.todoService.ListTodos()
	if err != nil {
		sendError(w, http.StatusInternalServerError, "Failed to list todos: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(todos); err != nil {
		http.Error(w, "Failed to encode todos: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

// CreateTodo handles POST /todos requests.
func (s *Server) CreateTodo(w http.ResponseWriter, r *http.Request) {
	var reqBody api.TodoCreationRequest
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid request body: %v", err))
		return
	}
	defer r.Body.Close()

	createdTodo, err := s.todoService.CreateTodo(reqBody)
	if err != nil {
		if err.Error() == "name is required" {
			sendError(w, http.StatusBadRequest, err.Error())
			return
		}
		sendError(w, http.StatusInternalServerError, "Failed to create todo: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(createdTodo); err != nil {
		http.Error(w, "Failed to encode created todo: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

// sendError is a helper to send a JSON error response according to the Error schema.
func sendError(w http.ResponseWriter, code int, message string) {
	errResponse := api.Error{
		Code:    int32(code),
		Message: message,
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(errResponse)
}
