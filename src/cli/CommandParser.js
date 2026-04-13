class CommandParser {
    static parse(argv) {
        const positional = [];
        const options = {};

        for (let index = 0; index < argv.length; index += 1) {
            const arg = argv[index];

            if (!arg.startsWith('--')) {
                positional.push(arg);
                continue;
            }

            const option = arg.slice(2);
            const [key, inlineValue] = option.split('=');

            if (inlineValue !== undefined) {
                options[key] = inlineValue;
                continue;
            }

            const nextArg = argv[index + 1];
            if (nextArg && !nextArg.startsWith('--')) {
                options[key] = nextArg;
                index += 1;
            } else {
                options[key] = true;
            }
        }

        const [command, resource, id] = positional;

        if (this.isLegacyMode(positional)) {
            const [baseUrl, apiKey, output] = positional;
            return {
                command: 'list',
                resource: 'domains',
                id: undefined,
                options: {
                    ...options,
                    'base-url': options['base-url'] || baseUrl,
                    'api-key': options['api-key'] || apiKey,
                    output: options.output || output,
                },
            };
        }

        return {
            command,
            resource,
            id,
            options,
        };
    }

    static isLegacyMode(positional) {
        const [first, second] = positional;
        if (!first || !second) {
            return false;
        }

        const looksLikeUrl = /^https?:\/\//i.test(first);
        const firstLooksLikeCommand = [
            'list',
            'get',
            'create',
            'update',
            'delete',
        ].includes(first);

        return looksLikeUrl && !firstLooksLikeCommand;
    }

    static parseJsonPayload(payloadRaw) {
        if (!payloadRaw) {
            return undefined;
        }

        try {
            return JSON.parse(payloadRaw);
        } catch (error) {
            throw new Error(
                'Invalid JSON payload in --data option. Example: --data "{\"name\":\"example\"}"',
            );
        }
    }

    static printHelp() {
        console.log('Keitaro Automation CLI');
        console.log('');
        console.log('Usage:');
        console.log('  npm start -- <command> <resource> [id] [options]');
        console.log('');
        console.log('Commands:');
        console.log('  list <resource>                        List entities');
        console.log(
            '  get <resource> <id>                    Get entity by id',
        );
        console.log('  create <resource> --data <json>        Create entity');
        console.log('  update <resource> <id> --data <json>   Update entity');
        console.log('  delete <resource> <id>                 Delete entity');
        console.log('');
        console.log('Global options (apply to all commands):');
        console.log('  --base-url <url>       Override KEITARO_BASE_URL');
        console.log('  --api-key <key>        Override KEITARO_API_KEY');
        console.log('  --timeout-ms <number>  Request timeout in ms');
        console.log(
            '  --retries <number>     Retry count for transient network/5xx errors',
        );
        console.log('  --log-level <level>    error|warn|info|debug');
        console.log('  --output <path>        Save command output to file');
        console.log(
            '  --value <name>         Return only this field from command response',
        );
        console.log('  --field <name>         Alias for --value');
        console.log('  --data <json>          JSON body for create/update');
        console.log('  --help                 Print help');
        console.log('');
        console.log('Legacy mode (backward-compatible):');
        console.log(
            '  npm start -- <keitaro_base_url> <api_key> [output_file]',
        );
    }
}

module.exports = {
    CommandParser,
};
