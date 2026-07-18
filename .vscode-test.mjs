import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	launchArgs: [
        "--user-data-dir=/tmp/sfrag-vscode-data",
        "--extensions-dir=/tmp/sfrag-vscode-extensions"
    ]
});
