const prompts = require('prompts');
const spawn = require('child_process').spawn;

const projectList = {
  ['takabase-dev']: {
    url: 'https://takabase-dev-api.web.app'
  },
  ['takabase-prod']: {
    url: 'https://takabase-prod-api.web.app'
  },
};

(async () => {
  const project = await prompts({
    type: 'select',
    name: 'project',
    message: 'Select a environment',
    choices: Object.keys(projectList).map((key ) => {
      return {
        title: key,
        value: key,
        description: projectList[key].url,
      }
    }),
    initial: 0
  });

  const action = await prompts({
    type: 'select',
    name: 'action',
    message: 'Select an action',
    choices: [
      {
        title: 'Deploy function',
        value: 'function',
        description: projectList[project.project].url,
      },
      {
        title: 'Deploy hosting',
        value: 'hosting',
        description: projectList[project.project].url,
      }
    ],
    initial: 0
  });

  const confirm = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Can you confirm?',
    initial: project.project !== 'takabase-prod'
  });

  if (project.project && action.action && confirm.confirm) {
    const command = [`firebase use ${project.project}`];

    if (project.project === 'takabase-dev') {
      command.unshift('export FIREBASE_FRAMEWORKS_BUILD_TARGET=\'development\'')
    }

    if (project.project === 'takabase-prod') {
      command.unshift('export FIREBASE_FRAMEWORKS_BUILD_TARGET=\'production\'')
    }

    if (action.action === 'function') {
      command.push(`firebase deploy --only functions`);
    }

    if (action.action === 'hosting') {
      command.push(`firebase deploy --only hosting:${project.project}`);
    }

    /** RUN */

    spawn(command.join(' && '), {
      shell: true,
      stdio:'inherit'
    });
  } else {
    console.log('Ok, Bye!');
  }
})();
