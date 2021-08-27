const lambdaLocal = require('lambda-local');
const path = require("path");
const dotenv = require('dotenv')
dotenv.config();

const config = require("../config")

const regex = /test/;

const jsonPayload = {
    "detail-type": "CodeBuild Build State Change",
    detail: {
        "build-status": "SUCCEEDED",
        "project-name": "test-dev-develop-project1"
    }
}

const jsonPayloadEcs = {
    "detail-type": "ECS Deployment State Change",
    resources: [
        "arn:aws:ecs:ap-northeast-1:111122223333:service/hoge-cluster/dev-hoge-module"
    ],
    detail: {
        eventName: "SERVICE_DEPLOYMENT_COMPLETED"
    }
}

// locationのURLはテストの時に
const jsonPayloadCloudFront = {
    "detail-type": "AWS API Call via CloudTrail",
    resources: [],
    detail: {
        eventName: "CreateInvalidation",
        eventSource: "cloudfront.amazonaws.com",
        responseElements: {
            "location": process.env.TEST_CF_URL
        }
    }
}

const main = async () => {
    config.distributions = [{
        "distributionId": process.env.TEST_DISTRI_ID,
        "env": "dev"
    }];
    try {
        const response = await lambdaLocal.execute({
            event: jsonPayloadCloudFront,
            lambdaPath: path.join(__dirname.replace(regex, ""), 'index.js'),
            timeoutMs: 3000
        })
        console.log("response", response);
    } catch (error) {
        console.log("error", error);
    }
}

main();