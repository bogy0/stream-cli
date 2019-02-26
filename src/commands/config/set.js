const { Command, flags } = require('@oclif/command');
const { prompt } = require('enquirer');
const emoji = require('node-emoji');
const chalk = require('chalk');
const opn = require('opn');
const path = require('path');
const fs = require('fs-extra');

class ConfigSet extends Command {
    async run() {
        const { flags } = this.parse(ConfigSet);
        const config = path.join(this.config.configDir, 'config.json');

        try {
            const exists = await fs.pathExists(config);

            if (!flags.name || !flags.email || !flags.key || !flags.secret) {
                if (exists) {
                    const confirm = await prompt({
                        type: 'confirm',
                        name: 'continue',
                        message: chalk.red.bold(
                            `This command will delete your current Stream configuration. Are you sure you want to continue? ${emoji.get(
                                'warning'
                            )} `
                        ),
                    });

                    if (!confirm.continue) {
                        this.exit(0);
                    }
                }

                const res = await prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: `What is your full name?`,
                        required: true,
                    },
                    {
                        type: 'input',
                        name: 'email',
                        message: `What is your email address associated with Stream?`,
                        required: true,
                    },
                    {
                        type: 'input',
                        name: 'key',
                        message: `What is your Stream API key?`,
                        required: true,
                    },
                    {
                        type: 'password',
                        name: 'secret',
                        message: `What is your Stream API secret?`,
                        required: true,
                    },
                ]);

                for (const key in res) {
                    if (res.hasOwnProperty(key)) {
                        flags[key] = res[key];
                    }
                }
            }

            await fs.writeJson(config, {
                name: flags.name,
                email: flags.email,
                apiKey: flags.key,
                apiSecret: flags.secret,
            });

            this.log(
                chalk.bold(`Your Stream CLI configuration has been generated!`),
                emoji.get('rocket')
            );
            this.exit(0);
        } catch (err) {
            this.error(err || 'A Stream CLI error has occurred.', { exit: 1 });
        }
    }
}

ConfigSet.flags = {
    name: flags.string({
        char: 'n',
        description: chalk.blue.bold('Full name for configuration.'),
        required: false,
    }),
    email: flags.string({
        char: 'e',
        description: chalk.blue.bold('Email for configuration.'),
        required: false,
    }),
    key: flags.string({
        char: 'k',
        description: chalk.blue.bold('API key for configuration.'),
        required: false,
    }),
    secret: flags.string({
        char: 's',
        description: chalk.blue.bold('API secret for configuration.'),
        required: false,
    }),
};

module.exports.ConfigSet = ConfigSet;
