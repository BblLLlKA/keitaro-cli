const { AppConfig } = require('../config/AppConfig');
const { CommandParser } = require('../cli/CommandParser');
const { Logger } = require('../core/Logger');
const {
    KeitaroApiClient,
    KeitaroApiError,
} = require('../core/KeitaroApiClient');
const { AutomationService } = require('../services/AutomationService');

class AutomationApp {
    constructor(argv = process.argv.slice(2)) {
        this.argv = argv;
    }

    async run() {
        const parsed = CommandParser.parse(this.argv);

        if (!parsed.command || parsed.options.help) {
            CommandParser.printHelp();
            return;
        }

        const config = AppConfig.from({
            baseUrl: parsed.options['base-url'],
            apiKey: parsed.options['api-key'],
            timeoutMs: parsed.options['timeout-ms'],
            retries: parsed.options.retries,
            logLevel: parsed.options['log-level'],
        });

        const logger = new Logger(config.logLevel);
        const apiClient = new KeitaroApiClient(config, logger);
        const service = new AutomationService(apiClient, logger);

        logger.debug(`Command received: ${JSON.stringify(parsed)}`);

        await this.dispatch(parsed, service);
    }

    async dispatch(parsed, service) {
        const { command, resource, id, options } = parsed;

        if (!resource) {
            throw new Error('Resource is required. Example: list domains');
        }

        switch (command) {
            case 'list':
                await service.list(resource, {
                    output: options.output,
                    value: options.value || options.field,
                });
                return;
            case 'get':
                this.ensureId(command, id);
                await service.get(resource, id, {
                    output: options.output,
                    value: options.value || options.field,
                });
                return;
            case 'create': {
                const payload = CommandParser.parseJsonPayload(options.data);
                if (
                    !payload ||
                    typeof payload !== 'object' ||
                    Array.isArray(payload)
                ) {
                    throw new Error(
                        'Create requires --data with JSON object payload',
                    );
                }
                await service.create(resource, payload, {
                    output: options.output,
                    value: options.value || options.field,
                });
                return;
            }
            case 'update': {
                this.ensureId(command, id);
                const payload = CommandParser.parseJsonPayload(options.data);
                if (
                    !payload ||
                    typeof payload !== 'object' ||
                    Array.isArray(payload)
                ) {
                    throw new Error(
                        'Update requires --data with JSON object payload',
                    );
                }
                await service.update(resource, id, payload, {
                    output: options.output,
                    value: options.value || options.field,
                });
                return;
            }
            case 'delete':
                this.ensureId(command, id);
                await service.remove(resource, id, {
                    output: options.output,
                    value: options.value || options.field,
                });
                return;
            default:
                throw new Error(
                    `Unknown command: ${command}. Use --help to see available commands.`,
                );
        }
    }

    ensureId(command, id) {
        if (!id) {
            throw new Error(`Command ${command} requires an id argument`);
        }
    }

    static async bootstrap(argv = process.argv.slice(2)) {
        const app = new AutomationApp(argv);

        try {
            await app.run();
        } catch (error) {
            if (error instanceof KeitaroApiError) {
                if (error.status) {
                    console.error(
                        `Keitaro API error ${error.status}: ${error.message}`,
                    );
                } else {
                    console.error(`Keitaro request failed: ${error.message}`);
                }
                process.exitCode = 1;
                return;
            }

            console.error(`Application error: ${error.message}`);
            process.exitCode = 1;
        }
    }
}

module.exports = {
    AutomationApp,
};
