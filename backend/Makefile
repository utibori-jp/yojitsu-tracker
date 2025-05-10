.PHONY: gen-api
gen-api:
	@echo "Starting API generation with oapi-codegen..."
	@oapi-codegen -generate chi-server -o internal/generated/api.gen.go -config internal/config/config.yml api/openapi.yml
	@echo "Code generation completed."

.PHONY: gen-type
gen-type:
	@echo "Starting type generation with oapi-codegen..."
	oapi-codegen -generate types -o internal/generated/type.gen.go -config internal/config/config.yml api/openapi.yml
	@echo "Type generation completed."
