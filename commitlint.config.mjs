import { defineConfig } from 'cz-git'
import fg from 'fast-glob'

const getPackages = (packagePath) =>
	fg.sync('*', { cwd: packagePath, onlyDirectories: true, deep: 2 })

const scopes = [
	...getPackages('packages'),
	...getPackages('apps'),
	'docs',
	'project',
	'style',
	'ci',
	'dev',
	'deploy',
	'other',
]

// Emoji
/** @type {import('cz-git').UserConfig} */
export default defineConfig({
	extends: ['@commitlint/config-conventional'], // extends can be nested
	parserPreset: 'conventional-changelog-conventionalcommits',
	rules: {
		'scope-enum': [2, 'always', scopes],
		'body-max-line-length': [2, 'always', 150],
	},
	prompt: {
		settings: {},
		messages: {
			skip: ':skip',
			max: 'upper %d chars',
			min: '%d chars at least',
			emptyWarning: 'can not be empty',
			upperLimitWarning: 'over limit',
			lowerLimitWarning: 'below limit',
		},
		types: [
			{ value: 'feat', name: 'feat:     ✨  A new feature', emoji: '✨ ' },
			{ value: 'fix', name: 'fix:      🐛  A bug fix', emoji: '🐛 ' },
			{
				value: 'docs',
				name: 'docs:     📝  Documentation only changes',
				emoji: '📝 ',
			},
			{
				value: 'style',
				name: 'style:    💄  Changes that do not affect the meaning of the code',
				emoji: '💄 ',
			},
			{
				value: 'refactor',
				name: 'refactor: 📦️   A code change that neither fixes a bug nor adds a feature',
				emoji: '📦️ ',
			},
			{
				value: 'perf',
				name: 'perf:     🚀  A code change that improves performance',
				emoji: '🚀 ',
			},
			{
				value: 'test',
				name: 'test:     🚨  Adding missing tests or correcting existing tests',
				emoji: '🚨 ',
			},
			{
				value: 'build',
				name: 'build:    🛠   Changes that affect the build system or external dependencies',
				emoji: '🛠 ',
			},
			{
				value: 'ci',
				name: 'ci:       🎡  Changes to our CI configuration files and scripts',
				emoji: '🎡 ',
			},
			{
				value: 'chore',
				name: "chore:    🔨  Other changes that don't modify src or test files",
				emoji: '🔨 ',
			},
			{
				value: 'revert',
				name: 'revert:   ⏪️  Reverts a previous commit',
				emoji: ':rewind:',
			},
		],
		useEmoji: true,
		confirmColorize: true,
		emojiAlign: 'center',
		questions: {
			scope: {
				description:
					'What is the scope of this change (e.g. component or file name)',
			},
			subject: {
				description: 'Write a short, imperative tense description of the change',
			},
			body: {
				description: 'Provide a longer description of the change',
			},
			isBreaking: {
				description: 'Are there any breaking changes?',
			},
			breakingBody: {
				description:
					'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
			},
			breaking: {
				description: 'Describe the breaking changes',
			},
			isIssueAffected: {
				description: 'Does this change affect any open issues?',
			},
			issuesBody: {
				description:
					'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
			},
			issues: {
				description: 'Add issue references (e.g. "fix #123", "re #123".)',
			},
		},
	},
})

// 汉化
// /** @type {import('cz-git').UserConfig} */
// module.exports = {
//     rules: {
//         // @see: https://commitlint.js.org/#/reference-rules
//     },
//     prompt: {
//         alias: { fd: 'docs: fix typos' },
//         messages: {
//             type: '选择你要提交的类型 :',
//             scope: '选择一个提交范围（可选）:',
//             customScope: '请输入自定义的提交范围 :',
//             subject: '填写简短精炼的变更描述 :\n',
//             body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
//             breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
//             footerPrefixesSelect: '选择关联issue前缀（可选）:',
//             customFooterPrefix: '输入自定义issue前缀 :',
//             footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
//             generatingByAI: '正在通过 AI 生成你的提交简短描述...',
//             generatedSelectByAI: '选择一个 AI 生成的简短描述:',
//             confirmCommit: '是否提交或修改commit ?'
//         },
//         types: [
//             { value: '特性', name: '特性:     新增功能' },
//             { value: '修复', name: '修复:     修复缺陷' },
//             { value: '文档', name: '文档:     文档变更' },
//             { value: '格式', name: '格式:     代码格式（不影响功能，例如空格、分号等格式修正）' },
//             { value: '重构', name: '重构:     代码重构（不包括 bug 修复、功能新增）' },
//             { value: '性能', name: '性能:     性能优化' },
//             { value: '测试', name: '测试:     添加疏漏测试或已有测试改动' },
//             { value: '构建', name: '构建:     构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）' },
//             { value: '集成', name: '集成:     修改 CI 配置、脚本' },
//             { value: '回退', name: '回退:     回滚 commit' },
//             { value: '其他', name: '其他:     对构建过程或辅助工具和库的更改（不影响源文件、测试用例）' }
//         ],
//         useEmoji: false,
//         emojiAlign: 'center',
//         useAI: false,
//         aiNumber: 1,
//         themeColorCode: '',
//         scopes: [],
//         allowCustomScopes: true,
//         allowEmptyScopes: true,
//         customScopesAlign: 'bottom',
//         customScopesAlias: '以上都不是？我要自定义',
//         emptyScopesAlias: '跳过',
//         upperCaseSubject: false,
//         markBreakingChangeMode: false,
//         allowBreakingChanges: ['feat', 'fix'],
//         breaklineNumber: 100,
//         breaklineChar: '|',
//         skipQuestions: [],
//         issuePrefixes: [
//             // 如果使用 gitee 作为开发管理
//             { value: 'link', name: 'link:     链接 ISSUES 进行中' },
//             { value: 'closed', name: 'closed:   标记 ISSUES 已完成' }
//         ],
//         customIssuePrefixAlign: 'top',
//         emptyIssuePrefixAlias: '跳过',
//         customIssuePrefixAlias: '自定义前缀',
//         allowCustomIssuePrefix: true,
//         allowEmptyIssuePrefix: true,
//         confirmColorize: true,
//         maxHeaderLength: Infinity,
//         maxSubjectLength: Infinity,
//         minSubjectLength: 0,
//         scopeOverrides: undefined,
//         defaultBody: '',
//         defaultIssues: '',
//         defaultScope: '',
//         defaultSubject: ''
//     }
// }
