## slack-notification-lambda

Code Build の成功・失敗を Slack に通知する Lambda 関数

## Slack への通知

以下の Node(Javascript) SDK を利用する<br>
https://slack.dev/node-slack-sdk/

今回はメッセージを投稿するだけなので以下<br>
https://slack.dev/node-slack-sdk/web-api

### channelId の調べ方

Slack を Web で開くと、

```
https://app.slack.com/client/{workspack id}/{channel id}
```

という URL になっているので、`{channel id}`の部分をコピペすればいい<br>
参考：https://auto-worker.com/blog/?p=132

### Code Build の Cloud Watch Event の Event オブジェクトの中身

Code Build では その build の build status ごとに Cloud Watch Event で Event が発火するが、その Event オブジェクトの中身は以下に書かれている<br>
https://docs.aws.amazon.com/ja_jp/codebuild/latest/userguide/sample-build-notifications.html#sample-build-notifications-ref

### ECS のサービスデプロイ状態が変更された際の Cloud Watch Event の Event オブジェクトの中身

ECS の場合も Code Build 同様に、Cloud Watch Event でそのイベントを捕捉でき、何個か種類があるがサービスデプロイが実行された場合の Event オブジェクトの中身は以下に書かれている<br>
https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/ecs_cwe_events.html#ecs_service_deployment_events

### Cloud Front の Create Invalidation が実行された際の Cloud Trail の Event オブジェクトの中身

Cloud Front の場合は、Code Build・ECS とは違い、Cloud Watch Event で捕捉できるのは、`AWS API Call via CloudTrail`（Cloud Trail に記録されるイベント）だけなので、Cloud Trail で記録されるイベントを見ていく必要がある

CloudTrail での Cloud Front の API Call の記録については、[CloudTrail での CloudFront 情報](https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/logging_using_cloudtrail.html#service-name-info-in-cloudtrail)に書かれている通りで、その API 一覧については[API Reference Actions](https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_Operations.html)に書かれている

今回は[`CreateInvalidation`](https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_CreateInvalidation.html)で、その オブジェクトの中身は[AWS CLI コマンドのリファレンスページ](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cloudfront/create-invalidation.html)に例が書かれている

```json
{
  "Location": "https://cloudfront.amazonaws.com/2019-03-26/distribution/EDFDVBD6EXAMPLE/invalidation/I2J0I21PCUYOIK",
  "Invalidation": {
    "Id": "I2J0I21PCUYOIK",
    "Status": "InProgress",
    "CreateTime": "2019-12-05T18:40:49.413Z",
    "InvalidationBatch": {
      "Paths": {
        "Quantity": 2,
        "Items": [
          "/example-path/example-file.jpg",
          "/example-path/example-file2.png"
        ]
      },
      "CallerReference": "cli-example"
    }
  }
}
```

※ただしここで注意だが、上記の JSON はあくまで API Call の response の中身であるという事<br>
Cloud Trail に記録されるオブジェクト（JSON）とは以下の形式で、`responseElements`のキーに上記の JSON が組み込まれた形で、Cloud Watch Event の Event オブジェクトになる（Lambda 関数とかで受け取る場合、event は以下の JSON が渡ってくる）<br>

・参考：[CloudTrail ログイベントリファレンス](https://docs.aws.amazon.com/ja_jp/awscloudtrail/latest/userguide/cloudtrail-event-reference.html)

```json
{
  "eventVersion": "1.05",
  "userIdentity": {
    "type": "IAMUser",
    "principalId": "AIDAJDPLRKLG7UEXAMPLE",
    "arn": "arn:aws:iam::123456789012:user/Mary_Major",
    "accountId": "123456789012",
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "userName": "Mary_Major",
    "sessionContext": {
      "sessionIssuer": {},
      "webIdFederationData": {},
      "attributes": {
        "mfaAuthenticated": "false",
        "creationDate": "2019-06-18T22:28:31Z"
      }
    },
    "invokedBy": "signin.amazonaws.com"
  },
  "eventTime": "2019-06-19T00:18:31Z",
  "eventSource": "cloudtrail.amazonaws.com",
  "eventName": "StartLogging",
  "awsRegion": "us-east-2",
  "sourceIPAddress": "203.0.113.64",
  "userAgent": "signin.amazonaws.com",
  "requestParameters": {
    "name": "arn:aws:cloudtrail:us-east-2:123456789012:trail/My-First-Trail"
  },
  "responseElements": null,
  "requestID": "ddf5140f-EXAMPLE",
  "eventID": "7116c6a1-EXAMPLE",
  "readOnly": false,
  "eventType": "AwsApiCall",
  "recipientAccountId": "123456789012"
}
```

そして Cloud Trail のイベントオブジェクトを Cloud Watch Event で捕捉する（`AWS API Call via CloudTrail`）ので、以下のような Event オブジェクトを Lambda 関数などで受け取る事になる<br>
以下は Cloud Front の CloudTrail に記録される Event オブジェクトではない

```json
{
  "version": "0",
  "id": "c030038d-8c4d-6141-9545-00ff7b7153EX",
  "detail-type": "AWS API Call via CloudTrail",
  "source": "aws.cloudfront",
  "account": "123456789012",
  "time": "2017-09-01T16:14:28Z",
  "region": "us-west-1",
  "resources": [],
  "detail": {
    "eventVersion": "1.05",
    "userIdentity": {
      "type": "IAMUser",
      "principalId": "AIDAJDPLRKLG7UEXAMPLE",
      "arn": "arn:aws:iam::123456789012:user/Mary_Major",
      "accountId": "123456789012",
      "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
      "userName": "Mary_Major",
      "sessionContext": {
        "sessionIssuer": {},
        "webIdFederationData": {},
        "attributes": {
          "mfaAuthenticated": "false",
          "creationDate": "2019-06-18T22:28:31Z"
        }
      },
      "invokedBy": "signin.amazonaws.com"
    },
    "eventTime": "2019-06-19T00:18:31Z",
    "eventSource": "cloudtrail.amazonaws.com",
    "eventName": "StartLogging",
    "awsRegion": "us-east-2",
    "sourceIPAddress": "203.0.113.64",
    "userAgent": "signin.amazonaws.com",
    "requestParameters": {
      "name": "arn:aws:cloudtrail:us-east-2:123456789012:trail/My-First-Trail"
    },
    "responseElements": null,
    "requestID": "ddf5140f-EXAMPLE",
    "eventID": "7116c6a1-EXAMPLE",
    "readOnly": false,
    "eventType": "AwsApiCall",
    "recipientAccountId": "123456789012"
  }
}
```

JSON を見ると分かるが、`CreateInvalidation`が API として Call された後それが完了したか？は自分で Cloud Front に問い合わせる必要があり、[`GetInvalidation`](https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_GetInvalidation.html)で問い合わせができる<br>
`GetInvalidation`で返されるオブジェクトを見るには AWS CLI コマンドの[`get-invalidation`](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cloudfront/get-invalidation.html)を見るとその例が載っており、以下のようなオブジェクト（JSON）である事が分かる

```json
{
  "Invalidation": {
    "Status": "Completed",
    "InvalidationBatch": {
      "Paths": {
        "Items": [
          "/example-path/example-file.jpg",
          "/example-path/example-file-2.jpg"
        ],
        "Quantity": 2
      },
      "CallerReference": "cli-example"
    },
    "Id": "I2J0I21PCUYOIK",
    "CreateTime": "2019-12-05T18:40:49.413Z"
  }
}
```

これで invalidation の状態を取得し、`Completed`になったら Deploy 成功を通知する

・参考：[CloudFront Client - AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cloudfront/index.html)
・参考：[Class GetInvalidationCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cloudfront/classes/getinvalidationcommand.html)

### Lambda の Publish Version が実行された際の Cloud Trail の Event オブジェクトの中身

Lambda の場合は、Cloud Front と同様に Cloud Watch Event で捕捉できるのは、`AWS API Call via CloudTrail`（Cloud Trail に記録されるイベント）だけなので、Cloud Trail で記録されるイベントを見ていく必要がある

CloudTrail での Lambda の API Call の記録については、[CloudTrail 内の AWS Lambda 情報](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/logging-using-cloudtrail.html)に書かれている通りで、その API 一覧については[API Reference > Actions](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/API_Operations.html)に書かれている

今回は[`PublishVersion`](https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_CreateInvalidation.html)で、その オブジェクトの中身は[PublishVersion > Response Elements](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/API_PublishVersion.html#API_PublishVersion_ResponseElements)にどんなキーが含まれるか？が書かれている<br>
この中身が`responseElements`になる<br>
※注意事項としては実際に CloudTrail に出力される PublishVersion の request/response（CloudTrail の requestParameters/responseElements） は*キャメルケース*になる<br>

CloudFront と同様に、Cloud Trail のイベントオブジェクトを Cloud Watch Event で捕捉する（`AWS API Call via CloudTrail`）ので、以下のような Event オブジェクトを Lambda 関数などで受け取る事になる

```json
{
  "version": "0",
  "id": "c030038d-8c4d-6141-9545-00ff7b7153EX",
  "detail-type": "AWS API Call via CloudTrail",
  "source": "aws.cloudfront",
  "account": "123456789012",
  "time": "2017-09-01T16:14:28Z",
  "region": "us-west-1",
  "resources": [],
  "detail": {
    "eventVersion": "1.05",
    "userIdentity": {...},
    "eventTime": "2019-06-19T00:18:31Z",
    "eventSource": "lambda.amazonaws.com",
    "eventName": "PublishVersion20150331",
    "awsRegion": "us-east-2",
    "sourceIPAddress": "203.0.113.64",
    "userAgent": "aws-sdk-js/...",
    "requestParameters": {
      "functionName": "hoge"
    },
    "responseElements": {
      "tracingConfig": {
          "mode": "PassThrough"
      },
      "codeSha256": "dBG9m8SGdmlEjw/JYXlhhvCrAv5TxvXsbL/RMr0fT/I=",
      "functionName": "my-function",
      "codeSize": 294,
      "revisionId": "f31d3d39-cc63-4520-97d4-43cd44c94c20",
      "memorySize": 128,
      "functionArn": "arn:aws:lambda:us-west-2:123456789012:function:my-function:3",
      "version": "3",
      "role": "arn:aws:iam::123456789012:role/service-role/MyTestFunction-role-zgur6bf4",
      "timeout": 3,
      "lastModified": "2019-09-23T18:32:33.857+0000",
      "handler": "my-function.handler",
      "runtime": "nodejs10.x",
      "description": "",
      "lastUpdateStatus": "Successful"
    },
    "requestID": "ddf5140f-EXAMPLE",
    "eventID": "7116c6a1-EXAMPLE",
    "readOnly": false,
    "eventType": "AwsApiCall",
    "recipientAccountId": "123456789012"
  }
}
```

### 各サービスの何らかのイベントでトリガーする設定について

基本的には、各サービスの API Reference に書かれている API は全て CloudTrail で記録される対象になるので、それで Event を捕捉しそれをトリガーにする事は可能

CloudTrail で捕捉されるイベントの Event オブジェクトのついては[CloudTrail ログイベントリファレンス](https://docs.aws.amazon.com/ja_jp/awscloudtrail/latest/userguide/cloudtrail-event-reference.html)<br>
このオブジェクトが Cloud Watch Event の`detail`キーの中身になる

### Slack のメッセージの仕様

#### blocks

https://api.slack.com/reference/block-kit/blocks

#### attachment

https://api.slack.com/reference/messaging/attachments
