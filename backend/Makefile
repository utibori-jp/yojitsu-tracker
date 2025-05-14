.PHONY: gen-api
gen-api:
	@echo "Starting API generation with oapi-codegen..."
	@oapi-codegen -generate chi-server,spec -o internal/generated/api.gen.go -config internal/config/config.yml api/openapi.yml
	@echo "Code generation completed."

.PHONY: gen-type
gen-type:
	@echo "Starting type generation with oapi-codegen..."
	@oapi-codegen -generate types -o internal/generated/type.gen.go -config internal/config/config.yml api/openapi.yml
	@echo "Type generation completed."

.PHONY: start-backend
start-backend:
	@echo "Starting backend..."
	@go mod tidy
	@go run cmd/api/main.go -a
	@echo "Finish backend..."

.PHONY: ent-generate
ent-generate:
	@echo "Generating schemas with ent"
	go generate ./ent
	@echo "Finish generating schemas"
