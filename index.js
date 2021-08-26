const { WebClient } = require('@slack/web-api');
const { createBuildResultMsg, createEcsDeployResultMsg } = require('./utility/message')

const web = new WebClient(process.env.SLACK_OAUTH_TOKEN);

exports.handler = async (event) => {
    let msgObj;
    const statusCode = { statusCode: 200 }

    switch (event["detail-type"]) {
        case "CodeBuild Build State Change":
            msgObj = createBuildResultMsg(event);
            break;
        case "ECS Deployment State Change":
            msgObj = createEcsDeployResultMsg(event);
            break;
        default:
            break;
    }

    if (event.detail.eventName === "SERVICE_DEPLOYMENT_IN_PROGRESS") {
        const response = {
            ...statusCode,
            body: "ECS Service deployment in progress. Not run slack notification.",
        };
        return response;
    } else {
        const result = await web.chat.postMessage({
            ...msgObj,
            channel: process.env.SLACK_CHANNNEL_ID
        });
        const response = {
            ...statusCode,
            body: `Successfully send message ${result.ts}`,
        };

        return response;
    }
}