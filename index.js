const { WebClient } = require('@slack/web-api');

const web = new WebClient(process.env.SLACK_OAUTH_TOKEN);

exports.handler = async (event) => {
    const result = await web.chat.postMessage({
        text: "fallback messgae",
        blocks: [{
            "type": "section",
            "text":
            {
                "type": "plain_text",
                "text": "Hello world"
            }
        }],
        channel: process.env.SLACK_CHANNNEL_ID,
    });

    console.log("event", event);

    const response = {
        statusCode: 200,
        body: `Successfully send message ${result.ts}`,
    };
    return response;
}