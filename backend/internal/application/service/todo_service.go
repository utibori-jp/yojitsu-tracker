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
		Id:               utils.Ptr(entTodo.ID), // Use utils.Ptr for nullable ID in API spec.
		Name:             entTodo.Name,
		Description:      entTodo.Description,
		EstimatedTimeSec: entTodo.EstimatedTimeSec,
		ActualTimeSec:    entTodo.ActualTimeSec,
		DueDate:          dueDatePtr,
		Priority:         api.TodoPriority(entTodo.Priority), // Cast to API enum type.
		Status:           api.TodoStatus(entTodo.Status),     // Cast to API enum type.
		ReflectionMemo:   entTodo.ReflectionMemo,
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
	if reqBody.EstimatedTimeSec <= 0 { // OpenAPI schema has minimum: 1.
		return nil, fmt.Errorf("%w: EstimatedTimeSec must be positive", ErrValidationFailed)
	}

	// 2. Prepare ent's Create builder.
	createBuilder := s.client.Todo.Create().
		SetName(reqBody.Name).
		SetEstimatedTimeSec(reqBody.EstimatedTimeSec)

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

// UpdateTodo updates an existing TODO item in the database.
// It first fetches the todo, then applies the changes from the request body, and saves it back.
func (s *TodoService) UpdateTodo(ctx context.Context, todoId int32, reqBody api.TodoUpdateRequest) (*api.Todo, error) {
	// 1. Fetch the existing todo to ensure it exists.
	existingTodo, err := s.client.Todo.Get(ctx, int(todoId))
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, ErrTodoNotFound
		}
		return nil, fmt.Errorf("failed to get todo for update: %w", err)
	}

	// 2. Prepare ent's UpdateOne builder.
	updateBuilder := s.client.Todo.UpdateOne(existingTodo)

	// 3. Apply updates from reqBody if fields are provided.
	// Note: oapi-codegen ensures minProperties: 1 for TodoUpdateRequest.
	// The handler should have already validated this.

	// Update Name if provided.
	if reqBody.Name != nil {
		if *reqBody.Name == "" { // Additional validation if needed, though schema has minLength
			return nil, fmt.Errorf("%w: name cannot be empty when provided for update", ErrValidationFailed)
		}
		updateBuilder.SetName(*reqBody.Name)
	}

	// Update Description if provided.
	if reqBody.Description != nil {
		// SetNillableDescription handles both setting a value and setting to null.
		updateBuilder.SetNillableDescription(reqBody.Description)
	}

	// Update EstimatedTimeSec if provided.
	if reqBody.EstimatedTimeSec != nil {
		if *reqBody.EstimatedTimeSec <= 0 { // Schema has minimum: 1
			return nil, fmt.Errorf("%w: EstimatedTimeSec must be positive when provided for update", ErrValidationFailed)
		}
		// ent.Todo.EstimatedTimeSec is int32, reqBody.EstimatedTimeSec is *int32
		updateBuilder.SetEstimatedTimeSec(*reqBody.EstimatedTimeSec)
	}

	// Update ActualTimeSec if provided.
	if reqBody.ActualTimeSec != nil {
		// ent.Todo.ActualTimeSec is *int32, reqBody.ActualTimeSec is *int32
		// SetNillableActualTimeSec handles setting to a value or to null.
		updateBuilder.SetNillableActualTimeSec(reqBody.ActualTimeSec)
	}

	// Update DueDate if provided.
	if reqBody.DueDate != nil {
		if reqBody.DueDate.IsZero() { // Treat zero date as clearing the due date
			updateBuilder.ClearDueDate()
		} else {
			parsedDueDate, err := time.Parse("2006-01-02", reqBody.DueDate.Format("2006-01-02"))
			if err == nil {
				updateBuilder.SetDueDate(parsedDueDate)
			} else {
				return nil, fmt.Errorf("%w: invalid due date format for update", ErrValidationFailed)
			}
		}
	}

	// Update Priority if provided.
	if reqBody.Priority != nil {
		p := todo.Priority(*reqBody.Priority)
		if err := todo.PriorityValidator(p); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrPriorityInvalid, err)
		}
		updateBuilder.SetPriority(p)
	}

	// Update Status if provided.
	if reqBody.Status != nil {
		st := todo.Status(*reqBody.Status)
		if err := todo.StatusValidator(st); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrStatusInvalid, err)
		}
		updateBuilder.SetStatus(st)
	}

	// Update ReflectionMemo if provided.
	if reqBody.ReflectionMemo != nil {
		updateBuilder.SetNillableReflectionMemo(reqBody.ReflectionMemo)
	}

	// 4. Save changes to the database.
	updatedEntTodo, err := updateBuilder.Save(ctx)
	if err != nil {
		if ent.IsValidationError(err) {
			return nil, fmt.Errorf("%w: %v", ErrValidationFailed, err)
		}
		return nil, fmt.Errorf("failed to update todo in database: %w", err)
	}

	return toAPITodo(updatedEntTodo), nil
}

// DeleteTodo deletes a TODO item from the database by its ID.
func (s *TodoService) DeleteTodo(ctx context.Context, todoId int32) error {
	err := s.client.Todo.DeleteOneID(int(todoId)).Exec(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return ErrTodoNotFound
		}
		return fmt.Errorf("failed to delete todo from database: %w", err)
	}
	return nil
}
