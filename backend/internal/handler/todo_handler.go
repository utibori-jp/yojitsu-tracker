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

// TodoHandler is responsible for handling HTTP requests related to TODO items.
// It uses a TodoService to interact with the business logic and data layer.
type TodoHandler struct {
	todoService *services.TodoService // Service for TODO operations.
}

// NewTodoHandler creates a new TodoHandler.
// It takes a TodoService as a dependency.
func NewTodoHandler(todoService *services.TodoService) *TodoHandler {
	return &TodoHandler{todoService: todoService}
}

// ListTodos handles GET /todos requests.
// It retrieves all TODO items using the TodoService and returns them as a JSON response.
func (h *TodoHandler) ListTodos(w http.ResponseWriter, r *http.Request) {
	// Call the service to get the list of todos.
	todos, err := h.todoService.ListTodos(r.Context())
	if err != nil {
		// Log the error and send a generic server error response.
		log.Printf("Error listing todos: %v", err)
		sendError(w, http.StatusInternalServerError, "Failed to list todos")
		return
	}

	// Set content type and status code for a successful response.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	// Encode the list of todos into the response body.
	if err := json.NewEncoder(w).Encode(todos); err != nil {
		log.Printf("Error encoding todos response: %v", err)
		// If encoding fails, it's a server-side issue.
		// Note: Headers might have already been written, so http.Error is a fallback.
		// Consider if a more specific error response is needed here or if logging is sufficient.
	}
}

// CreateTodo handles POST /todos requests.
func (h *TodoHandler) CreateTodo(w http.ResponseWriter, r *http.Request) {
	var reqBody api.TodoCreationRequest
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		// Handle errors during request body decoding (e.g., malformed JSON).
		sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid request body: %v", err))
		return
	}
	defer r.Body.Close() // Ensure the request body is closed.

	// Call the service to create the new todo.
	createdTodo, err := h.todoService.CreateTodo(r.Context(), reqBody)
	if err != nil {
		// Handle specific errors returned by the service.
		if errors.Is(err, services.ErrNameRequired) ||
			errors.Is(err, services.ErrValidationFailed) ||
			errors.Is(err, services.ErrPriorityInvalid) ||
			errors.Is(err, services.ErrStatusInvalid) {
			sendError(w, http.StatusBadRequest, err.Error())
		} else {
			log.Printf("CRITICAL: Failed to create todo in service. Underlying error: %+v", err) // Using %+v can sometimes give more detail for wrapped errors.
			// For unexpected errors, send a generic server error.
			sendError(w, http.StatusInternalServerError, "Failed to create todo")
		}
		return
	}

	// Set content type and status code for a successful creation.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	// Encode the created todo into the response body.
	if err := json.NewEncoder(w).Encode(createdTodo); err != nil {
		log.Printf("Error encoding created todo response: %v", err)
		// If encoding fails after a successful creation.
	}
}

// UpdateTodo handles PUT /todo/{todoId} requests.
// It updates an existing TODO item identified by todoId.
func (h *TodoHandler) UpdateTodo(w http.ResponseWriter, r *http.Request, todoId int32) {
	var reqBody api.TodoUpdateRequest
	// Decode request body. oapi-codegen middleware should have validated basic format and minProperties.
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		// Handle errors during request body decoding.
		sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid request body: %v", err))
		return
	}
	defer r.Body.Close()

	updatedTodo, err := h.todoService.UpdateTodo(r.Context(), todoId, reqBody)
	if err != nil {
		// Handle specific errors from the service.
		if errors.Is(err, services.ErrTodoNotFound) {
			sendError(w, http.StatusNotFound, err.Error())
		} else if errors.Is(err, services.ErrValidationFailed) ||
			errors.Is(err, services.ErrPriorityInvalid) ||
			errors.Is(err, services.ErrStatusInvalid) {
			// Validation errors from the service layer.
			sendError(w, http.StatusBadRequest, err.Error())
		} else {
			// For other unexpected errors, log and send a generic server error.
			log.Printf("Error updating todo with ID %d: %v", todoId, err)
			sendError(w, http.StatusInternalServerError, "Failed to update todo")
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // Successful update.
	// Encode the updated todo into the response body.
	if err := json.NewEncoder(w).Encode(updatedTodo); err != nil {
		log.Printf("Error encoding updated todo response: %v", err)
		// If encoding fails after a successful update.
	}
}

// DeleteTodo handles DELETE /todo/{todoId} requests.
// It deletes a TODO item identified by todoId.
func (h *TodoHandler) DeleteTodo(w http.ResponseWriter, r *http.Request, todoId int32) {
	// Call the service to delete the todo.
	err := h.todoService.DeleteTodo(r.Context(), todoId)
	if err != nil {
		// Handle specific errors from the service.
		if errors.Is(err, services.ErrTodoNotFound) {
			sendError(w, http.StatusNotFound, err.Error())
		} else {
			// For other unexpected errors, log and send a generic server error.
			log.Printf("Error deleting todo with ID %d: %v", todoId, err)
			sendError(w, http.StatusInternalServerError, "Failed to delete todo")
		}
		return
	}
	// Successful deletion, no content to return.
	w.WriteHeader(http.StatusNoContent)
}

// sendError is a helper function to standardize error responses.
// It marshals an api.Error DTO and sends it with the given HTTP status code.
func sendError(w http.ResponseWriter, code int, message string) {
	// Create the error response DTO.
	errResponse := api.Error{
		Code:    int32(code),
		Message: message,
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)                    // Set the HTTP status code.
	json.NewEncoder(w).Encode(errResponse) // Encode and send the error response.
}
