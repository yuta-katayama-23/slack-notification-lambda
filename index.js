const { WebClient } = require('@slack/web-api');
const { createBuildResultMsg, createEcsDeployResultMsg, createCloudFrontDeployResultMsg, createLambdaDeployResultMsg } = require('./utility/message')
const { shouldInvaliCompleted } = require("./service")

const web = new WebClient(process.env.SLACK_OAUTH_TOKEN);

exports.handler = async (event) => {
    try {
        let msgObj;
        let notPostMsgFlag = true;
        const statusCode = { statusCode: 200 }

        // Cloud Trail Event Object
        if (event.detail.eventSource) {
            switch (event.detail.eventName) {
                case "CreateInvalidation":
                    const result = await shouldInvaliCompleted(event.detail.responseElements);
                    msgObj = createCloudFrontDeployResultMsg(result);
                    notPostMsgFlag = false;
                    break;
                case "PublishVersion20150331":
                    msgObj = createLambdaDeployResultMsg(event);
                    notPostMsgFlag = false;
                    break;
            }
        } else {
            switch (event["detail-type"]) {
                case "CodeBuild Build State Change":
                    msgObj = createBuildResultMsg(event);
                    notPostMsgFlag = false;
                    break;
                case "ECS Deployment State Change":
                    msgObj = createEcsDeployResultMsg(event);
                    notPostMsgFlag = event.detail.eventName === "SERVICE_DEPLOYMENT_IN_PROGRESS" ? true : false;
                    break;
            }
        }

        if (notPostMsgFlag) {
            console.log("Unnecessary post slack message.")
            const response = {
                ...statusCode,
                message: "Unnecessary post slack message.",
            };
            return response;
        } else {
            const result = await web.chat.postMessage({
                ...msgObj,
                channel: process.env.SLACK_CHANNNEL_ID
            });
            const response = {
                ...statusCode,
                message: `Successfully send message ${result.ts}`,
            };
            console.log(`Successfully send message ${result.ts}.`)

            return response;
        }
    } catch (error) {
        return errorHandler(error);
    }
}

const errorHandler = (error) => {
    const obj = {};
    obj["status"] = 500;
    obj["message"] = error.message;
    obj["stack"] = error.stack;

    console.log("errorHandler", obj);
    return obj;
}