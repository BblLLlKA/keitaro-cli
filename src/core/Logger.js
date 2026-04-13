const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

class Logger {
    constructor(level = 'info') {
        this.level = LEVELS[level] !== undefined ? level : 'info';
    }

    shouldLog(level) {
        return LEVELS[level] <= LEVELS[this.level];
    }

    format(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    error(message) {
        if (this.shouldLog('error')) {
            console.error(this.format('error', message));
        }
    }

    warn(message) {
        if (this.shouldLog('warn')) {
            console.warn(this.format('warn', message));
        }
    }

    info(message) {
        if (this.shouldLog('info')) {
            console.log(this.format('info', message));
        }
    }

    debug(message) {
        if (this.shouldLog('debug')) {
            console.log(this.format('debug', message));
        }
    }
}

module.exports = {
    Logger,
};
