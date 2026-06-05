-include .env
export

SHELL := /bin/bash
.DEFAULT_GOAL := help

SRC_DIR := ./Queens
PLAYWRIGHT_DIR := ./Browser
TEST_DIR := ./Tests

# .NET configuration
SLN         := ./queens.sln
CSPROJ      := $(SRC_DIR)/Queens.csproj
TEST_CSPROJ := $(TEST_DIR)/Tests.csproj
TARGET      := $(if $(SLN),$(SLN),$())
CONFIG      ?= Debug
FRAMEWORK   ?= net10.0
RUNTIME     ?= 
OUTDIR      ?= bin/$(CONFIG)
RUN_ARGS    ?=
DOTNET      := dotnet

# Docker configuration
DOCKER     := docker
DOCKERFILE ?= ./Dockerfile
DOCKER_PLATFORM   ?= linux/arm64
IMAGE_NAME ?= queens.net
IMAGE_TAG  ?= latest
IMAGE      := $(IMAGE_NAME):$(IMAGE_TAG)

# Terraform configuration
TF      := terraform
TF_DIR  ?= inf

# Environment configuration
AWS_ID     ?= 
AWS_REGION ?= us-east-2

# Browser (from dev container env)
BROWSER ?=

.PHONY: help env restore build run watch test coverage clean publish format docker-build docker-tag docker-run docker-push tf-init tf-validate tf-plan tf-apply tf-destroy

help: ## Show available targets
	@awk 'BEGIN { FS = ":.*##" } /^[a-zA-Z0-9_.-]+:.*##/ { printf "  %-18s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

env: ## Show detected environment info
	@echo "Solution:  $(SLN)"
	@echo "Project:   $(CSPROJ)"
	@echo "Test Project:   $(TEST_CSPROJ)"
	@echo "Config:    $(CONFIG)"
	@echo "Framework: $(FRAMEWORK)"
	@echo "Runtime:   $(RUNTIME)"
	@echo "OutDir:    $(OUTDIR)"
	@echo "Image:     $(IMAGE)"
	@echo "TF Dir:    $(TF_DIR)"

restore:
	@[ -n "$(TARGET)" ] || { echo "No .sln or .csproj found."; exit 1; }
	$(DOTNET) restore $(TARGET)

build: restore
	$(DOTNET) build "$(TARGET)" \
        --no-restore \
        -c "$(CONFIG)" \
        $(if $(FRAMEWORK),-f "$(FRAMEWORK)") \
        $(if $(RUNTIME),-r "$(RUNTIME)")

# run: ## Run the project
# 	@[ -n "$(CSPROJ)" ] || { echo "No .csproj found."; exit 1; }
# 	$(DOTNET) run --project "$(CSPROJ)" -c "$(CONFIG)" $(if $(FRAMEWORK),-f "$(FRAMEWORK)") -- $(RUN_ARGS)

# watch: ## Watch and run on file changes
# 	@[ -n "$(CSPROJ)" ] || { echo "No .csproj found."; exit 1; }
# 	$(DOTNET) watch --project "$(CSPROJ)" run -c "$(CONFIG)" -- $(RUN_ARGS)

# test: ## Run tests
# 	@[ -n "$(TARGET)" ] || { echo "No .sln or .csproj found."; exit 1; }
# 	$(DOTNET) test "$(TARGET)" -c "$(CONFIG)" --no-build

# coverage: ## Run tests with coverage; generates HTML if reportgenerator is available
# 	@[ -n "$(TARGET)" ] || { echo "No .sln or .csproj found."; exit 1; }
# 	$(DOTNET) test "$(TARGET)" -c "$(CONFIG)" --collect:"XPlat Code Coverage" --results-directory coverage
# 	@if command -v reportgenerator >/dev/null 2>&1; then \
# 		reportgenerator -reports:coverage/**/coverage.cobertura.xml -targetdir:coverage/html -reporttypes:Html; \
# 		echo "Coverage HTML: coverage/html/index.html"; \
# 		if [ -n "$(BROWSER)" ] && [ -f coverage/html/index.html ]; then \
# 			"$(BROWSER)" coverage/html/index.html; \
# 		fi; \
# 	else \
# 		echo "Install reportgenerator for HTML: dotnet tool install -g dotnet-reportgenerator-globaltool"; \
# 		echo "Cobertura XML is in coverage/**/coverage.cobertura.xml"; \
# 	fi

# clean: ## Clean build output
# 	@[ -n "$(TARGET)" ] || { echo "No .sln or .csproj found."; exit 1; }
# 	$(DOTNET) clean "$(TARGET)" -c "$(CONFIG)"

# publish: ## Publish app to ./out
# 	@[ -n "$(CSPROJ)" ] || { echo "No .csproj found."; exit 1; }
# 	$(DOTNET) publish "$(CSPROJ)" -c "$(CONFIG)" $(if $(FRAMEWORK),-f "$(FRAMEWORK)") $(if $(RUNTIME),-r "$(RUNTIME)") -o out --self-contained false

format: ## Format code (requires dotnet-format)
	@if dotnet format --version >/dev/null 2>&1; then \
		dotnet format; \
	else \
		echo "dotnet-format not found. Install: dotnet tool install -g dotnet-format"; \
		exit 1; \
	fi

docker-build: ## Build Docker image
	@command -v $(DOCKER) >/dev/null || { echo "docker not found on PATH"; exit 1; }
	$(DOCKER) build --platform $(DOCKER_PLATFORM) --provenance=false -t $(IMAGE) -f $(DOCKERFILE) .

docker-tag: docker-build
	@command -v $(DOCKER) >/dev/null || { echo "docker not found on PATH"; exit 1; }
	$(DOCKER) tag "$(IMAGE)" "$(AWS_ID).dkr.ecr.us-east-2.amazonaws.com/queens:latest"

docker-run: ## Run Docker image
	@command -v $(DOCKER) >/dev/null || { echo "docker not found on PATH"; exit 1; }
	$(DOCKER) run --platform $(DOCKER_PLATFORM) --env-file .env --network host --rm -it $(IMAGE)

docker-attach: ## Run Docker image
	@command -v $(DOCKER) >/dev/null || { echo "docker not found on PATH"; exit 1; }
	$(DOCKER) run --platform $(DOCKER_PLATFORM) --env-file .env --network host --rm -it $(IMAGE) bash

docker-push: docker-tag
	@command -v $(DOCKER) >/dev/null || { echo "docker not found on PATH"; exit 1; }
	$(DOCKER) push $(AWS_ID).dkr.ecr.us-east-2.amazonaws.com/queens:latest

docker-login:
	@command -v $(DOCKER) >/dev/null || { echo "docker not found on PATH"; exit 1; }
	aws ecr get-login-password | $(DOCKER) login --username AWS --password-stdin $(AWS_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

tf-init: ## Terraform init in $(TF_DIR)
	@command -v $(TF) >/dev/null || { echo "terraform not found on PATH"; exit 1; }
	@[ -d "$(TF_DIR)" ] || { echo "Terraform dir '$(TF_DIR)' not found."; exit 1; }
	$(TF) -chdir="$(TF_DIR)" init -backend-config=backend.conf

tf-validate: ## Terraform validate
	@command -v $(TF) >/dev/null || { echo "terraform not found on PATH"; exit 1; }
	$(TF) -chdir="$(TF_DIR)" validate

tf-plan: ## Terraform plan
	@command -v $(TF) >/dev/null || { echo "terraform not found on PATH"; exit 1; }
	$(TF) -chdir="$(TF_DIR)" plan

tf-apply: ## Terraform apply
	@command -v $(TF) >/dev/null || { echo "terraform not found on PATH"; exit 1; }
	$(TF) -chdir="$(TF_DIR)" apply

tf-destroy: ## Terraform destroy
	@command -v $(TF) >/dev/null || { echo "terraform not found on PATH"; exit 1; }
	$(TF) -chdir="$(TF_DIR)" destroy

deploy: docker-push
	aws lambda update-function-code --function-name queens --image-uri $(AWS_ID).dkr.ecr.us-east-2.amazonaws.com/queens:latest

invoke-lambda:
	aws lambda invoke --function-name queens --payload '{}' /tmp/response.json
