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
