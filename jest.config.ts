import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
	preset: "ts-jest/presets/js-with-ts-esm",
	testEnvironment: "node",
	extensionsToTreatAsEsm: [".ts"],
	detectLeaks: true,
	detectOpenHandles: true,
	moduleNameMapper: {
		"(.+)\\.js": "$1",
	},
	transform: {
		"\\.[jt]s$": [
			"ts-jest",
			{
				tsconfig: "tsconfig.jest.json",
				useESM: true,
			},
		],
	},
};

export default jestConfig;
