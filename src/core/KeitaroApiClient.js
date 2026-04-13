const axios = require('axios');

class KeitaroApiError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'KeitaroApiError';
        this.status = status;
    }
}

class KeitaroApiClient {
    constructor(config, logger) {
        this.logger = logger;
        this.retries = config.retries;
        this.client = axios.create({
            baseURL: `${config.baseUrl}/admin_api/v1`,
            timeout: config.timeoutMs,
            headers: {
                'Api-Key': config.apiKey,
                'Content-Type': 'application/json',
            },
        });
        this.handledStatuses = new Set([400, 401, 402, 500]);
    }

    async request(method, path, data) {
        for (let attempt = 0; attempt <= this.retries; attempt += 1) {
            try {
                const response = await this.client.request({
                    method,
                    url: path,
                    data,
                });
                return response.data;
            } catch (error) {
                const status = error.response?.status;
                const apiMessage = error.response?.data?.error;
                const fallbackMessage =
                    error.message || 'Unknown request error';
                const canRetry = this.shouldRetry(status, attempt);

                if (canRetry) {
                    const delayMs = 400 * (attempt + 1);
                    this.logger.warn(
                        `Request failed on attempt ${attempt + 1}. Retrying in ${delayMs}ms...`,
                    );
                    await this.sleep(delayMs);
                    continue;
                }

                if (status && this.handledStatuses.has(status)) {
                    const message =
                        typeof apiMessage === 'string' &&
                        apiMessage.trim() !== ''
                            ? apiMessage
                            : 'API returned an error without details';
                    throw new KeitaroApiError(status, message);
                }

                if (status) {
                    const message =
                        typeof apiMessage === 'string' &&
                        apiMessage.trim() !== ''
                            ? apiMessage
                            : fallbackMessage;
                    throw new KeitaroApiError(status, message);
                }

                throw new KeitaroApiError(undefined, fallbackMessage);
            }
        }

        throw new KeitaroApiError(undefined, 'Request failed after retries');
    }

    shouldRetry(status, attempt) {
        if (attempt >= this.retries) {
            return false;
        }

        if (!status) {
            return true;
        }

        return status >= 500;
    }

    async sleep(ms) {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async list(resource) {
        return this.request('get', `/${resource}`);
    }

    async getById(resource, id) {
        return this.request('get', `/${resource}/${id}`);
    }

    async create(resource, payload) {
        return this.request('post', `/${resource}`, payload);
    }

    async update(resource, id, payload) {
        return this.request('put', `/${resource}/${id}`, payload);
    }

    async remove(resource, id) {
        return this.request('delete', `/${resource}/${id}`);
    }
}

module.exports = {
    KeitaroApiClient,
    KeitaroApiError,
};
