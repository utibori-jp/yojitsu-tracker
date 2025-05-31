package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
)

// Todo holds the schema definition for the Todo entity.
type Todo struct {
	ent.Schema
}

// Mixin to include common fields (ID, CreatedAt, UpdatedAt, etc.).
func (Todo) Mixin() []ent.Mixin {
	return []ent.Mixin{
		TimeMixin{}, // Provides created_at and updated_at.
	}
}

// Fields of the Todo.
// Defines fields based on OpenAPI's components.schemas.Todo.
func (Todo) Fields() []ent.Field {
	return []ent.Field{
		// name: OpenAPI: required, type: string, minLength: 1, maxLength: 255
		field.String("name").
			NotEmpty().                   // Corresponds to minLength: 1
			MaxLen(255).                  // maxLength: 255
			Comment("Name of the task."), // OpenAPI: Name of the task.

		// description: OpenAPI: nullable: true, type: string, maxLength: 1000
		field.String("description").
			Optional().                                   // Optional because nullable: true
			Nillable().                                   // Makes Go type a pointer and allows NULL in DB
			MaxLen(1000).                                 // maxLength: 1000
			Comment("Detailed description of the task."), // OpenAPI: Detailed description of the task.

		// estimatedTime: OpenAPI: required, type: integer, format: int32, minimum: 1
		field.Int32("estimated_time_sec"). // Use Int32 according to format: int32
							Min(1).
							Default(1).                                                 // minimum: 1
							Comment("Estimated time to complete the task in seconds."), // OpenAPI: Estimated time to complete the task in seconds.

		// actualTime: OpenAPI: type: integer, format: int32, minimum: 0
		// (Optional/Nillable because it's not required in OpenAPI's Todo schema)
		field.Int32("actual_time_sec"). // format: int32
						Min(0).
						Default(0).                                           // minimum: 0
						Comment("Actual time spent on the task in seconds."), // OpenAPI: Actual time spent on the task in seconds.

		// dueDate: OpenAPI: nullable: true, type: string, format: date
		field.Time("due_date").
			Optional(). // Optional because nullable: true
			Nillable().
			Comment("Due date for the task (YYYY-MM-DD)."), // OpenAPI: Due date for the task (YYYY-MM-DD).

		// priority: OpenAPI: required, type: string, enum: [high, medium, low]
		// Set default in DB considering TodoCreationRequest's default: medium
		field.Enum("priority").
			Values("high", "medium", "low").  // Match OpenAPI enum values
			Default("medium").                // Set default value
			Comment("Priority of the task."), // OpenAPI: Priority of the task.

		// status: OpenAPI: required, type: string, enum: [todo, doing, pending, done]
		// It's common to default to 'todo' upon creation.
		field.Enum("status").
			Values("todo", "doing", "pending", "done"). // Match OpenAPI enum values
			Default("todo").                            // Set default value
			Comment("Current status of the task."),     // OpenAPI: Current status of the task.

		// reflectionMemo: OpenAPI: nullable: true, type: string, maxLength: 2000
		field.String("reflection_memo").
			Optional(). // Optional because nullable: true
			Nillable().
			MaxLen(2000).                                           // maxLength: 2000
			Comment("Reflection memo added upon task completion."), // OpenAPI: Reflection memo added upon task completion.
	}
}

// Edges of the Todo.
func (Todo) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("owner", User.Type).
			Ref("todos").
			Unique().
			Comment("The user who owns this TODO task."),
	}
}

// TimeMixin is a mixin that adds created_at and updated_at fields.
type TimeMixin struct {
	mixin.Schema
}

// Fields of the TimeMixin.
func (TimeMixin) Fields() []ent.Field {
	return []ent.Field{
		field.Time("created_at").
			Immutable().
			Default(time.Now).
			Comment("Record creation date and time."),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("Record last update date and time."),
	}
}
