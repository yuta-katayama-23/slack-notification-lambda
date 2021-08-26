const { CloudFrontClient, GetInvalidationCommand } = require("@aws-sdk/client-cloudfront");
const client = new CloudFrontClient({ region: process.env.REGION });

const distriRegex = new RegExp(process.env.CF_DISTRI_REGEX);
const invaliRegex = new RegExp(process.env.CF_INVALI_REGEX);

const shouldInvaliCompleted = async (invalidation) => {
    const distributionId = invalidation.location.match(distriRegex)
        ? invalidation.location.match(distriRegex)[1]
        : "regex error";
    const invalidationId = invalidation.location.match(invaliRegex)
        ? invalidation.location.match(invaliRegex)[1]
        : "regex error";

    if (distributionId === "regex error" || invalidationId === "regex error") {
        return { result: "リリース作業の結果を取得できません。正規表現を確認してください。", distributionId };
    }

    const command = new GetInvalidationCommand({ DistributionId: distributionId, Id: invalidationId });

    let invaliResult = null;
    for (let index = 0; index < 5; index++) {
        const response = await client.send(command);
        console.log(`count is "${index}", invalidation status is "${response.Invalidation.Status}"`);
        if (response.Invalidation.Status === "Completed") {
            invaliResult = "Completed";
            break;
        }
        sleep(3000);
    }

    return { result: invaliResult ? invaliResult : "Failed", distributionId };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    shouldInvaliCompleted
}