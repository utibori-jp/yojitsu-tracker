package services

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/oapi-codegen/runtime/types"
	api "github.com/utibori-jp/yojitsu-tracker/internal/generated"
)

// ptr is a helper function to get a pointer to a value.
func ptr[T any](v T) *T {
	return &v
}

// convertCreationPriorityToTodoPriority converts *api.TodoCreationRequestPriority to *api.TodoPriority.
func convertCreationPriorityToTodoPriority(creationPriority *api.TodoCreationRequestPriority) *api.TodoPriority {
	if creationPriority == nil {
		return nil
	}
	p := api.TodoPriority(*creationPriority)
	return &p
}

// TodoService provides operations for TODO items.
type TodoService struct {
}

// NewTodoService creates a new TodoService.
func NewTodoService() *TodoService {
	return &TodoService{}
}

// ListTodos returns a mock list of TODO items.
func (s *TodoService) ListTodos() ([]api.Todo, error) {
	todos := []api.Todo{
		{
			Id:            ptr(float32(1)),
			Name:          ptr("Complete project proposal"),
			Description:   ptr("Finalize and submit the project proposal by EOD."),
			DueDate:       &types.Date{Time: time.Date(2024, time.August, 1, 0, 0, 0, 0, time.UTC)},
			EstimatedTime: ptr(int32(120)),
			ActualTime:    ptr(float32(90)),
			Priority:      ptr(api.TodoPriorityHigh),
			Status:        ptr(api.TodoStatusDoing),
			ReflectionMemo: ptr("Started well, got a bit stuck on budget section."),
		},
		{
			Id:            ptr(float32(2)),
			Name:          ptr("Schedule team meeting"),
			Description:   ptr("Organize a meeting for next week to discuss milestones."),
			DueDate:       &types.Date{Time: time.Date(2024, time.July, 25, 0, 0, 0, 0, time.UTC)},
			EstimatedTime: ptr(int32(30)),
			Priority:      ptr(api.TodoPriorityMedium),
			Status:        ptr(api.TodoStatusTodo),
		},
	}
	return todos, nil
}

// CreateTodo creates a new TODO item based on the request.
func (s *TodoService) CreateTodo(reqBody api.TodoCreationRequest) (*api.Todo, error) {
	if reqBody.Name == "" {
		return nil, fmt.Errorf("name is required")
	}

	newID := float32(rand.Intn(10000) + 100)

	newTodo := api.Todo{
		Id:            ptr(newID),
		Name:          ptr(reqBody.Name),
		Description:   reqBody.Description,
		DueDate:       reqBody.DueDate,
		EstimatedTime: ptr(reqBody.EstimatedTime),
		Priority:      convertCreationPriorityToTodoPriority(reqBody.Priority),
		Status:        ptr(api.TodoStatusTodo),
	}

	return &newTodo, nil
}
