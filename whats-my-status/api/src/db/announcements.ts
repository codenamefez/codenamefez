import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { config } from "../config.js";
import type {
  Announcement,
  AnnouncementType,
} from "../types.js";
import { docClient, newId, now } from "./client.js";

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: config.tables.announcements,
      FilterExpression: "#active = :active",
      ExpressionAttributeNames: { "#active": "active" },
      ExpressionAttributeValues: { ":active": true },
    })
  );
  const items = (result.Items as Announcement[]) || [];
  return items.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: config.tables.announcements })
  );
  const items = (result.Items as Announcement[]) || [];
  return items.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: config.tables.announcements,
      Key: { id },
    })
  );
  return (result.Item as Announcement) ?? null;
}

export async function createAnnouncement(data: {
  title: string;
  message: string;
  type?: AnnouncementType;
}): Promise<Announcement> {
  const timestamp = now();
  const announcement: Announcement = {
    id: newId(),
    title: data.title,
    message: data.message,
    type: data.type ?? "info",
    active: true,
    created_at: timestamp,
    updated_at: timestamp,
  };
  await docClient.send(
    new PutCommand({
      TableName: config.tables.announcements,
      Item: announcement,
    })
  );
  return announcement;
}

export async function updateAnnouncement(
  id: string,
  data: Partial<Pick<Announcement, "title" | "message" | "type" | "active">>
): Promise<Announcement | null> {
  const existing = await getAnnouncement(id);
  if (!existing) return null;
  const updated: Announcement = {
    ...existing,
    ...data,
    updated_at: now(),
  };
  await docClient.send(
    new PutCommand({
      TableName: config.tables.announcements,
      Item: updated,
    })
  );
  return updated;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  await docClient.send(
    new DeleteCommand({
      TableName: config.tables.announcements,
      Key: { id },
    })
  );
  return true;
}
