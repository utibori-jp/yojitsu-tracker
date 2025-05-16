package utils

// ptr is a helper function to get a pointer to a value.
func Ptr[T any](v T) *T {
	return &v
}
