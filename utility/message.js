const envRegex = new RegExp(process.env.ENV_REGEX);
const moduleRegex = new RegExp(process.env.MODULE_REGEX);
const ecsServiceRegex = new RegExp(process.env.ECS_SERVICE_REGEX);

const createBuildResultMsg = (event) => {
    const pjName = event.detail["project-name"];
    const envName = pjName.match(envRegex)
        ? pjName.match(envRegex)[1]
        : "環境名を取得できません。正規表現を確認してください。";
    const moduleName = pjName.match(moduleRegex)
        ? pjName.match(moduleRegex)[1]
        : "モジュール名を取得できません。正規表現を確認してください。";

    const msg = {
        text: "fallback messgae",
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "<!channel>"
                }
            },
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "ビルド結果の通知"
                }
            }
        ],
        attachments: [
            {
                color: `${event.detail["build-status"] === "SUCCEEDED" ? "#36a64f" : "#dc3545"}`,
                blocks: [
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": `*モジュール名（ビルドプロジェクト名）*\n${moduleName}\n(${pjName})`
                            },
                            {
                                "type": "mrkdwn",
                                "text": `*Deploy予定環境*\n${envName}`
                            },
                            {
                                "type": "mrkdwn",
                                "text": `*ビルドの結果*\n${event.detail["build-status"] === "SUCCEEDED" ? "成功" : "失敗"}`
                            }
                        ]
                    }
                ]
            }
        ]
    }

    return msg;
}

const createEcsDeployResultMsg = (event) => {
    const serviceNames = event.resources.map(
        resource => resource.match(ecsServiceRegex)
            ? resource.match(ecsServiceRegex)[1]
            : "サービス名を取得できません。正規表現を確認してください。"
    );

    const msg = {
        text: "fallback messgae",
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "<!channel>"
                }
            },
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "リリース作業の結果の通知"
                }
            }
        ],
        "attachments": [
            {
                color: `${event.detail.eventName === "SERVICE_DEPLOYMENT_COMPLETED" ? "#36a64f" : "#dc3545"}`,
                blocks: [
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": `*リリースサービス名*\n${serviceNames.join(", ")}`
                            },
                            {
                                "type": "mrkdwn",
                                "text": `*リリース作業の結果*\n${event.detail.eventName === "SERVICE_DEPLOYMENT_COMPLETED" ? "リリース作業が完了致しました" : "リリース作業が失敗しています、確認してください"}`
                            }
                        ]
                    }
                ]
            }
        ]
    }

    return msg;
}

module.exports = {
    createBuildResultMsg,
    createEcsDeployResultMsg
}