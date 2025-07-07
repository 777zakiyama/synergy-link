"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageCreated = exports.onMatchCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
exports.onMatchCreated = functions.firestore
    .document("matches/{matchId}")
    .onCreate(async (snap, context) => {
    const matchData = snap.data();
    const userIds = matchData.userIds;
    try {
        const [user1Doc, user2Doc] = await Promise.all([
            db.collection("users").doc(userIds[0]).get(),
            db.collection("users").doc(userIds[1]).get(),
        ]);
        const user1Data = user1Doc.data();
        const user2Data = user2Doc.data();
        if (!user1Data || !user2Data) {
            console.error("User data not found for match:", context.params.matchId);
            return;
        }
        const notificationPayload = {
            title: "Synergy Link",
            body: "新しいマッチが成立しました！",
            icon: "ic_notification",
            sound: "default",
        };
        const dataPayload = {
            type: "match",
            matchId: context.params.matchId,
            screen: "ChatList",
        };
        const notifications = [];
        if (user1Data.fcmToken) {
            notifications.push(messaging.send({
                token: user1Data.fcmToken,
                notification: notificationPayload,
                data: dataPayload,
                android: {
                    notification: {
                        channelId: "matches",
                        priority: "high",
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            badge: 1,
                            sound: "default",
                        },
                    },
                },
            }));
        }
        if (user2Data.fcmToken) {
            notifications.push(messaging.send({
                token: user2Data.fcmToken,
                notification: notificationPayload,
                data: dataPayload,
                android: {
                    notification: {
                        channelId: "matches",
                        priority: "high",
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            badge: 1,
                            sound: "default",
                        },
                    },
                },
            }));
        }
        await Promise.all(notifications);
        console.log(`Match notifications sent for match: ${context.params.matchId}`);
    }
    catch (error) {
        console.error("Error sending match notifications:", error);
    }
});
exports.onMessageCreated = functions.firestore
    .document("matches/{matchId}/messages/{messageId}")
    .onCreate(async (snap, context) => {
    var _a;
    const messageData = snap.data();
    const senderId = messageData.user._id;
    const matchId = context.params.matchId;
    try {
        const matchDoc = await db.collection("matches").doc(matchId).get();
        const matchData = matchDoc.data();
        if (!matchData) {
            console.error("Match data not found:", matchId);
            return;
        }
        const userIds = matchData.userIds;
        const recipientId = userIds.find((id) => id !== senderId);
        if (!recipientId) {
            console.error("Recipient not found for message:", context.params.messageId);
            return;
        }
        const [recipientDoc, senderDoc] = await Promise.all([
            db.collection("users").doc(recipientId).get(),
            db.collection("users").doc(senderId).get(),
        ]);
        const recipientData = recipientDoc.data();
        const senderData = senderDoc.data();
        if (!recipientData || !senderData) {
            console.error("User data not found for message notification");
            return;
        }
        if (!recipientData.fcmToken) {
            console.log("Recipient has no FCM token, skipping notification");
            return;
        }
        const senderName = ((_a = senderData.profile) === null || _a === void 0 ? void 0 : _a.fullName) || "ユーザー";
        const notificationPayload = {
            title: "Synergy Link",
            body: `${senderName}さんから新しいメッセージです`,
            icon: "ic_notification",
            sound: "default",
        };
        const dataPayload = {
            type: "message",
            matchId: matchId,
            senderId: senderId,
            screen: "Chat",
        };
        await messaging.send({
            token: recipientData.fcmToken,
            notification: notificationPayload,
            data: dataPayload,
            android: {
                notification: {
                    channelId: "messages",
                    priority: "high",
                },
            },
            apns: {
                payload: {
                    aps: {
                        badge: 1,
                        sound: "default",
                    },
                },
            },
        });
        console.log(`Message notification sent to ${recipientId} for message: ${context.params.messageId}`);
    }
    catch (error) {
        console.error("Error sending message notification:", error);
    }
});
//# sourceMappingURL=index.js.map