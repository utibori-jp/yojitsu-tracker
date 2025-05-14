package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/oapi-codegen/runtime/types"
	"github.com/utibori-jp/yojitsu-tracker/ent"
	"github.com/utibori-jp/yojitsu-tracker/ent/todo"
	api "github.com/utibori-jp/yojitsu-tracker/internal/generated"
	"github.com/utibori-jp/yojitsu-tracker/internal/utils"
)

// Custom errors defined in the service layer (for checking in the Handler).
var (
	ErrTodoNotFound     = errors.New("todo not found")
	ErrNameRequired     = errors.New("name is required")
	ErrValidationFailed = errors.New("validation failed") // More generic validation error.
	ErrPriorityInvalid  = errors.New("invalid priority value")
	ErrStatusInvalid    = errors.New("invalid status value")
)

// TodoService provides operations for TODO items.
// It encapsulates the business logic related to todos.
type TodoService struct {
	client *ent.Client // Ent client for database operations.
}

// NewTodoService creates a new TodoService.
// It takes an ent.Client as a dependency for interacting with the database.
func NewTodoService(client *ent.Client) *TodoService { // Accepts ent client as an argument.
	return &TodoService{client: client}
}

// --- Mapper functions (from ent.Todo to api.Todo) ---

// toAPITodo converts an ent.Todo entity to an api.Todo DTO.
func toAPITodo(entTodo *ent.Todo) *api.Todo {
	if entTodo == nil {
		return nil
	}

	// Handle nullable DueDate.
	var dueDatePtr *types.Date
	if entTodo.DueDate != nil && !entTodo.DueDate.IsZero() { // Check if DueDate is set and not zero.
		dueDatePtr = &types.Date{Time: *entTodo.DueDate}
	}

	return &api.Todo{
		Id:             utils.Ptr(entTodo.ID), // Use utils.Ptr for nullable ID in API spec.
		Name:           entTodo.Name,
		Description:    entTodo.Description,
		EstimatedTime:  entTodo.EstimatedTime,
		ActualTime:     entTodo.ActualTime,
		DueDate:        dueDatePtr,
		Priority:       api.TodoPriority(entTodo.Priority), // Cast to API enum type.
		Status:         api.TodoStatus(entTodo.Status),     // Cast to API enum type.
		ReflectionMemo: entTodo.ReflectionMemo,
	}
}

// toAPITodos converts a slice of ent.Todo entities to a slice of api.Todo DTOs.
func toAPITodos(entTodos []*ent.Todo) []api.Todo {
	if len(entTodos) == 0 {
		return []api.Todo{} // Return empty slice if input is empty.
	}
	apiTodos := make([]api.Todo, len(entTodos))
	for i, et := range entTodos {
		apiTodo := toAPITodo(et) // Convert each ent.Todo.
		if apiTodo != nil {
			apiTodos[i] = *apiTodo
		}
	}
	return apiTodos
}

// ListTodos returns a list of TODO items from the database.
func (s *TodoService) ListTodos(ctx context.Context) ([]api.Todo, error) {
	// Query all todos from the database.
	entTodos, err := s.client.Todo.
		Query().
		// TODO: Add filtering or pagination as needed.
		// Order(ent.Desc(todo.FieldCreatedAt)). // Example: Order by creation date descending.
		All(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list todos from database: %w", err)
	}

	// Convert ent.Todo entities to api.Todo DTOs.
	return toAPITodos(entTodos), nil
}

// CreateTodo creates a new TODO item in the database.
// CreateTodo creates a new TODO item in the database based on the provided request body.
func (s *TodoService) CreateTodo(ctx context.Context, reqBody api.TodoCreationRequest) (*api.Todo, error) {
	// 1. Input validation (for business logic not covered by API schema level validation).
	//    Ent schema validations (`NotEmpty`, `Min`, `MaxLen`, etc.) are performed during DB save,
	//    but pre-checking in the service layer is also possible.
	if reqBody.Name == "" { // OpenAPI schema has minLength: 1, so this should usually be caught by Handler/oapi-codegen.
		return nil, ErrNameRequired
	}
	if reqBody.EstimatedTime <= 0 { // OpenAPI schema has minimum: 1.
		return nil, fmt.Errorf("%w: estimatedTime must be positive", ErrValidationFailed)
	}

	// 2. Prepare ent's Create builder.
	createBuilder := s.client.Todo.Create().
		SetName(reqBody.Name).
		SetEstimatedTime(reqBody.EstimatedTime)

	// Set optional fields.
	if reqBody.Description != nil {
		createBuilder.SetDescription(*reqBody.Description)
	}
	if reqBody.DueDate != nil {
		// Convert types.Date to time.Time.
		// types.Date is yyyy-mm-dd only, so time is set to 00:00.
		// Consider whether to ignore parse errors or treat them as errors.
		parsedDueDate, err := time.Parse("2006-01-02", reqBody.DueDate.Format("2006-01-02"))
		if err == nil {
			createBuilder.SetDueDate(parsedDueDate)
		}
		// else: Potentially log the parse error or return a validation error.
	}

	// Priority: Cast to ent's enum type and set.
	// TodoCreationRequest.priority is *string, so a nil check is necessary.
	// Ent's priority field has Default("medium"), so the default will be used if nil.
	if reqBody.Priority != nil {
		// Convert string to ent's enum type and validate.
		p := todo.Priority(*reqBody.Priority)
		if err := todo.PriorityValidator(p); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrPriorityInvalid, err)
		}
		createBuilder.SetPriority(p)
	}
	// Status: Default is set to "todo" in the ent schema, so it's not required in the request.
	// If it needs to be specifiable in the request, add similar processing as for priority.

	// 3. Save to the database.
	newEntTodo, err := createBuilder.Save(ctx)
	if err != nil {
		// Ent validation errors can be checked using ent.IsValidationError(err).
		if ent.IsValidationError(err) {
			return nil, fmt.Errorf("%w: %v", ErrValidationFailed, err)
		}
		// Unique constraint violations can be checked using ent.IsConstraintError(err).
		return nil, fmt.Errorf("failed to create todo in database: %w", err)
	}

	// Convert the newly created ent.Todo to api.Todo DTO.
	return toAPITodo(newEntTodo), nil
}
