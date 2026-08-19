import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({ url: process.env.Redis_url });

redisClient.connect().catch((err) => console.log("Redis connection failed", err));

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.Kafka_Broker || "localhost:9092"],
    });

    const consumer = kafka.consumer({ groupId: "mail-service-group" });

    await consumer.connect();

    await consumer.subscribe({ topic: "send-mail", fromBeginning: false });

    console.log("✅ Mail service consumer started, listening for sending mail");

    await consumer.run({
      eachMessage: async ({ partition, message }) => {
        try {
          const messageId = `mail:${partition}:${message.offset}`;

          const alreadyProcessed = await redisClient.get(messageId);
          if (alreadyProcessed) {
            console.log(`Skipping duplicate message: ${messageId}`);
            return;
          }

          const { to, subject, html } = JSON.parse(
            message.value?.toString() || "{}"
          );

          await transporter.sendMail({
            from: "Hireheaven <no-reply>",
            to,
            subject,
            html,
          });

          // mark as processed — TTL 7 days (Kafka default retention)
          await redisClient.set(messageId, "1", { EX: 60 * 60 * 24 * 7 });

          console.log(`Mail has been sent to ${to}`);
        } catch (error) {
          console.log("Failed to send mail", error);
        }
      },
    });
  } catch (error) {
    console.log("failed to start kafka consumer", error);
  }
};
