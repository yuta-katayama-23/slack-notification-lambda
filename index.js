const { WebClient } = require('@slack/web-api');

const envRegex = new RegExp(process.env.ENV_REGEX);
const moduleRegex = new RegExp(process.env.MODULE_REGEX);

const web = new WebClient(process.env.SLACK_OAUTH_TOKEN);

exports.handler = async (event) => {
    const pjName = event.detail["project-name"];
    const envName = pjName.match(envRegex)
        ? pjName.match(envRegex)[1]
        : "環境名を取得できません。正規表現を確認してください。";
    const moduleName = pjName.match(moduleRegex)
        ? pjName.match(moduleRegex)[1]
        : "モジュール名を取得できません。正規表現を確認してください。";

    const result = await web.chat.postMessage({
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
            },
            {
                "type": "divider"
            },
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
        ],
        channel: process.env.SLACK_CHANNNEL_ID,
    });

    const response = {
        statusCode: 200,
        body: `Successfully send message ${result.ts}`,
    };
    return response;
}