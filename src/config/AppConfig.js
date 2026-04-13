require('dotenv').config({ quiet: true });

class AppConfig {
    static from(argvOptions = {}) {
        const baseUrl = argvOptions.baseUrl || process.env.KEITARO_BASE_URL;
        const apiKey = argvOptions.apiKey || process.env.KEITARO_API_KEY;
        const timeoutMsRaw =
            argvOptions.timeoutMs || process.env.KEITARO_TIMEOUT_MS || '30000';
        const retriesRaw =
            argvOptions.retries || process.env.KEITARO_RETRIES || '1';
        const logLevel =
            argvOptions.logLevel || process.env.LOG_LEVEL || 'info';

        const timeoutMs = Number.parseInt(timeoutMsRaw, 10);
        const retries = Number.parseInt(retriesRaw, 10);

        if (!baseUrl || !apiKey) {
            throw new Error(
                'Missing configuration: provide KEITARO_BASE_URL and KEITARO_API_KEY in .env or via CLI options --base-url and --api-key',
            );
        }

        if (Number.isNaN(timeoutMs) || timeoutMs <= 0) {
            throw new Error(
                'Invalid timeout value. Use a positive integer for timeout in milliseconds.',
            );
        }

        if (Number.isNaN(retries) || retries < 0) {
            throw new Error(
                'Invalid retries value. Use 0 or positive integer.',
            );
        }

        return {
            baseUrl: baseUrl.replace(/\/+$/, ''),
            apiKey,
            timeoutMs,
            retries,
            logLevel,
        };
    }
}

module.exports = {
    AppConfig,
};
