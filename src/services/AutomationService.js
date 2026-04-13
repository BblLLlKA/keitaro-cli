const fs = require('node:fs/promises');
const path = require('node:path');

class AutomationService {
    constructor(apiClient, logger) {
        this.apiClient = apiClient;
        this.logger = logger;
    }

    async list(resource, options = {}) {
        const items = await this.apiClient.list(resource);
        await this.renderResult(items, options, `Fetched ${resource} list`);
    }

    async get(resource, id, options = {}) {
        const item = await this.apiClient.getById(resource, id);
        await this.renderResult(
            item,
            options,
            `Fetched ${resource} with id=${id}`,
        );
    }

    async create(resource, payload, options = {}) {
        const result = await this.apiClient.create(resource, payload);
        await this.renderResult(
            result,
            options,
            `Created ${resource} entity successfully`,
        );
    }

    async update(resource, id, payload, options = {}) {
        const result = await this.apiClient.update(resource, id, payload);
        await this.renderResult(
            result,
            options,
            `Updated ${resource} with id=${id}`,
        );
    }

    async remove(resource, id, options = {}) {
        const result = await this.apiClient.remove(resource, id);
        await this.renderResult(
            result,
            options,
            `Deleted ${resource} with id=${id}`,
        );
    }

    async renderResult(data, options, successMessage) {
        const valueField = options?.value;

        if (valueField) {
            const lines = this.extractValues(data, valueField);
            if (lines.length > 0) {
                console.log(lines.join('\n'));
            }

            if (options?.output) {
                const outputPath = path.resolve(options.output);
                const fileContent =
                    lines.length > 0 ? `${lines.join('\n')}\n` : '';
                await fs.writeFile(outputPath, fileContent, 'utf8');
                this.logger.info(`Saved ${lines.length} rows to ${outputPath}`);
                return;
            }

            this.logger.info(
                `${successMessage} using value field "${valueField}"`,
            );
            return;
        }

        const outputContent = JSON.stringify(data, null, 2);
        if (data !== undefined) {
            console.log(outputContent);
        }

        if (options?.output) {
            const outputPath = path.resolve(options.output);
            const fileContent = data !== undefined ? `${outputContent}\n` : '';
            await fs.writeFile(outputPath, fileContent, 'utf8');
            this.logger.info(`Saved full response to ${outputPath}`);
            return;
        }

        this.logger.info(successMessage);
    }

    extractValues(data, valueField) {
        const source = Array.isArray(data) ? data : [data];

        return source
            .map((item) => item?.[valueField])
            .filter((value) => value !== undefined && value !== null)
            .map((value) =>
                typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value),
            );
    }
}

module.exports = {
    AutomationService,
};
