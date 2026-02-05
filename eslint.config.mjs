import { configWithoutCloudSupport } from '@n8n/node-cli/eslint';

export default [
	...configWithoutCloudSupport,
	{
		ignores: ['coverage/**', 'dist/**', 'node_modules/**'],
	},
];
