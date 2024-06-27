/** @format */

import prompts from 'prompts';
import fs from 'node:fs';
import { spawnSync, execSync } from 'child_process';

const projectList: any = {
	['takabase-dev']: {
		url: 'https://takabase-dev.web.app'
	},
	['takabase-prod']: {
		url: 'https://takabase-prod.web.app'
	}
};

(async () => {
	const project: prompts.Answers<string> = await prompts({
		type: 'select',
		name: 'project',
		message: 'Select a environment',
		choices: Object.keys(projectList).map(key => {
			return {
				title: key,
				value: key,
				description: projectList[key].url
			};
		}),
		initial: 0
	});

	const action: prompts.Answers<string> = await prompts({
		type: 'select',
		name: 'action',
		message: 'Select an action',
		choices: [
			{
				title: 'Deploy function',
				value: 'function',
				description: projectList[project.project].url
			}
		],
		initial: 0
	});

	const confirm: prompts.Answers<string> = await prompts({
		type: 'confirm',
		name: 'confirm',
		message: 'Can you confirm?',
		initial: project.project !== 'takabase-prod'
	});

	if (project.project && action.action && confirm.confirm) {
		//! Make version

		const gitCommitHash: string = execSync('git rev-parse --short HEAD').toString().trim();
		const gitCommitDate: string = execSync('git log -1 --format=%cd --date=local').toString().trim();
		const gitBranch: string = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

		const version: string = `
			export const version = {
				gitCommitHash: '${gitCommitHash}',
				gitCommitDate: '${gitCommitDate}',
				gitBranch: '${gitBranch}'
			}
		`;

		fs.writeFileSync('./src/versions/version.new.ts', version);

		//! Make deploy

		const command: string[] = [`firebase use ${project.project}`];

		if (project.project === 'takabase-dev') {
			command.unshift("export FIREBASE_FRAMEWORKS_BUILD_TARGET='development'");
		}

		if (project.project === 'takabase-prod') {
			command.unshift("export FIREBASE_FRAMEWORKS_BUILD_TARGET='production'");
		}

		if (action.action === 'function') {
			command.push(`firebase deploy --only functions,hosting:${project.project}`);
		}

		/** RUN */

		spawnSync(command.join(' && '), {
			shell: true,
			stdio: 'inherit'
		});
	} else {
		console.log('Ok, Bye!');
	}
})();
