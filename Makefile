build-BetterHubApiFunction:
	mkdir -p "$(ARTIFACTS_DIR)"
	npm exec -- esbuild apps/server/src/lambda.ts --bundle --platform=node --format=cjs --target=node22 --minify --sourcemap --outfile="$(ARTIFACTS_DIR)/index.js" --external:pg-native
