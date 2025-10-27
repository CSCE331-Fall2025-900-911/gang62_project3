# Load environment variables from .env file
include .env
export

# out folder where schema.sql, upload.sql, queries.sql live
# assign this value only if it's not already set
# could technically do make schema OUT=build but why
OUT ?= scripts/templates

# marking as phony forces make to always run the commands for it, even if a file called schema exists
.PHONY: schema seed queries rebuild clean help connect

# ON_ERROR_STOP says to stop on any sql errors instead of continuing
# Uses credentials from .env file
schema:
	@echo "Setting up database schema..."
	@psql -h $(DB_HOST) -U $(DB_USER) -d $(DB_NAME) -v ON_ERROR_STOP=1 -f $(OUT)/schema.sql
	@echo "Schema setup complete!"

seed:
	@echo "Loading CSV data..."
	@psql -h $(DB_HOST) -U $(DB_USER) -d $(DB_NAME) -v ON_ERROR_STOP=1 -f $(OUT)/upload.sql
	@echo "CSV data loaded!"

queries:
	@echo "Running queries..."
	@psql -h $(DB_HOST) -U $(DB_USER) -d $(DB_NAME) -v ON_ERROR_STOP=1 -f $(OUT)/queries.sql

connect:
	@echo "Connecting to database..."
	@psql -h $(DB_HOST) -U $(DB_USER) -d $(DB_NAME)


rebuild: schema seed queries

clean: 
	@rm -rf $(OUT)
	@mvn clean

help:
	@echo "make schema  -> run schema.sql using .env credentials"
	@echo "make seed    -> load CSV data using upload.sql and .env credentials"
	@echo "make queries -> run queries.sql using .env credentials"
	@echo "make connect -> connect to database using .env credentials"
	@echo "make rebuild -> schema + seed + queries"
	@echo "make clean   -> removes $(OUT) directory and cleans Maven build"
