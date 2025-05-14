package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	services "github.com/utibori-jp/yojitsu-tracker/internal/application/service"
	api "github.com/utibori-jp/yojitsu-tracker/internal/generated"
)

type TodoHandler struct {
	todoService *services.TodoService
}

func NewTodoHandler(todoService *services.TodoService) *TodoHandler {
	return &TodoHandler{todoService: todoService}
}

// ListTodos handles GET /todos requests.
func (h *TodoHandler) ListTodos(w http.ResponseWriter, r *http.Request) {
	todos, err := h.todoService.ListTodos(r.Context())
	if err != nil {
		log.Printf("Error listing todos: %v", err)
		sendError(w, http.StatusInternalServerError, "Failed to list todos")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(todos); err != nil {
		log.Printf("Error encoding todos response: %v", err)
		http.Error(w, "Failed to encode todos response", http.StatusInternalServerError)
	}
}

// CreateTodo handles POST /todos requests.
func (h *TodoHandler) CreateTodo(w http.ResponseWriter, r *http.Request) {
	var reqBody api.TodoCreationRequest
	// リクエストボディのデコードとoapi-codegenによる基本的なバリデーション
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid request body: %v", err))
		return
	}
	defer r.Body.Close()

	createdTodo, err := h.todoService.CreateTodo(r.Context(), reqBody)
	if err != nil {
		if errors.Is(err, services.ErrNameRequired) ||
			errors.Is(err, services.ErrValidationFailed) ||
			errors.Is(err, services.ErrPriorityInvalid) ||
			errors.Is(err, services.ErrStatusInvalid) {
			sendError(w, http.StatusBadRequest, err.Error())
		} else {
			log.Printf("Error creating todo: %v", err)
			sendError(w, http.StatusInternalServerError, "Failed to create todo")
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(createdTodo); err != nil {
		log.Printf("Error encoding created todo response: %v", err)
		http.Error(w, "Failed to encode created todo response", http.StatusInternalServerError)
	}
}

func sendError(w http.ResponseWriter, code int, message string) {
	errResponse := api.Error{
		Code:    int32(code),
		Message: message,
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(errResponse)
}
