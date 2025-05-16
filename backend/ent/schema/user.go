package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Mixin to include common fields (ID, CreatedAt, UpdatedAt, etc.).
func (User) Mixin() []ent.Mixin {
	return []ent.Mixin{
		TimeMixin{}, // Provides created_at and updated_at.
	}
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("username").
			Unique().
			NotEmpty().
			Comment("Username"), // Username
		field.String("email").
			Unique().
			NotEmpty().
			Comment("Email address"), // Email address
		field.String("password_hash").
			NotEmpty().
			Sensitive().
			Comment("Hashed password"), // Hashed password
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("todos", Todo.Type).
			Comment("List of TODO tasks owned by this user"), // List of TODO tasks owned by this user
	}
}
