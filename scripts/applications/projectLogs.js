import loader from '/scripts/loader.js';
import logs from '/scripts/services/logs.js';

function formatShellCommands(entry) {
    console.log(entry);
    return '';
}

function parseCommand(command) {
    return {
        text: command.text,
        entry: command.entry,
        html: null,
    };
}

function printObject(object) {
    return JSON.stringify(object);
}

function getCommits(object) {
    try {
        const commits = object.push.changes[0].commits;
        const res = [];
        for (let commit of commits) {
            res.push({
                message: commit.message,
                author: commit.author.raw
            });
        }
        return res;
    } catch (e) {
        console.log(e);
        return [];
    }
}

loader.application('projectLogs', [async () => {
    function init() {
        return {
            logs: []
        }
    }

    async function startCycle(vm) {
        requestLogs(vm).then(() => {
            setTimeout(async () => {
                startCycle(vm);
            }, 5000);
        }).catch((e) => {
            setTimeout(async () => {
                startCycle(vm);
            }, 10000);
        });
    }

    function getLogKey(logItem) {
        const timestamp = logItem.event_time.toDate().getTime();
        return `${timestamp}_${ logItem.project_name }`;
    }

    function createOptions() {
        return {
            showData: false
        }
    }
    function mergeLogs(logData, logHash) {
        const res = {};
        for (let i = 0; i < logData.length; i++) {
            const item = logData[i];
            const key = getLogKey(item);
            const hashItem = logHash[key];
            item.options = (hashItem != null) ? hashItem.options : createOptions();
            res[key] = item;
        }
        return res;
    }


    let hashLog = {};
    async function requestLogs(vm) {
        const rData = await logs.get({ limit: 30, offset: 0});
        hashLog = mergeLogs(rData, hashLog);
        Vue.set(vm, 'logs', rData);
    }

    await loader.createVueTemplate({ path: '/pages/projectLogs.html', id: 'ProjectLogs-Template' });
    const res = {};

    res.Constructor = Vue.component('projectLogs', {
        template: '#ProjectLogs-Template',
        data: function () {
            return init();
        },
        methods: {
            hasError: function (log) {
                if (log.error != null) return true;
                try {
                    const deploy = log.deploy_results.deploy;
                    if (deploy == null) return false;
                    return deploy.success === false
                } catch (e) {
                    console.log(e);
                    return false;
                }
            },
            getCommands: function (log) {
                if (log.deploy_results == null) return [];
                const res = [];
                for (let key in log.deploy_results) {
                    if (!log.deploy_results.hasOwnProperty(key)) continue;
                    res.push({
                        text: key,
                        entry: log.deploy_results[key]
                    });
                }
                return res;
            },
            execCommand: function (log, command) {
                if ((log.options.currentCommand != null) && (log.options.currentCommand.text == command.text)) {
                    log.options.showData = false;
                    log.options.currentCommand = null;
                    return;

                }
                log.options.showData = true;
                Vue.set(log.options, 'currentCommand', parseCommand(command));
            },
            showError: function (log) {
                if (log.error == null) return;
                this.execCommand(log, {
                    text: 'error',
                    entry: printObject(log.error)
                })
            },
            showCommits: function (log) {
                this.execCommand(log, {
                    text: 'commits',
                    entry: getCommits(log.event_data)
                });
            }
        },
        mounted: function () {
            startCycle(this);
        }
    });
    return res;
}]);

