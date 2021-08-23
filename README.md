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

### Slack のメッセージの仕様

#### blocks

https://api.slack.com/reference/block-kit/blocks

#### attachment

https://api.slack.com/reference/messaging/attachments
