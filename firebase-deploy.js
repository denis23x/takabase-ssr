const prompts = require('prompts');
const spawn = require('child_process').spawn;

(async () => {
  const select = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select a environment',
    choices: [
      {
        title: 'takabase-dev',
        value: 'takabase-dev',
        description: 'https://takabase-dev.web.app',
      },
      {
        title: 'takabase-prod',
        value: 'takabase-prod',
        description: 'https://takabase-prod.web.app',
      },
    ],
    initial: 0
  });

  const confirm = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Can you confirm?',
    initial: select.value !== 'takabase-prod'
  });

  if (select.value && confirm.value) {
    const buildTarget = () => {
      switch (select.value) {
        case 'takabase-dev': {
          return 'export FIREBASE_FRAMEWORKS_BUILD_TARGET=\'development\'';
        }
        case 'takabase-prod': {
          return 'export FIREBASE_FRAMEWORKS_BUILD_TARGET=\'production\'';
        }
        default: {
          return 'exit;';
        }
      }
    };

    const command = `${buildTarget()} && firebase use ${select.value} && firebase deploy --only functions,hosting:${select.value}`;

    /** RUN */

    spawn(command, {
      shell: true,
      stdio:'inherit'
    });
  } else {
    console.log('Ok, Bye!');
  }
})();
