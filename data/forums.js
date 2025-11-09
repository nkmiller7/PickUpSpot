import { forums } from "../config/mongoCollections.js";
import validation from './validation.js';
import { ObjectId } from 'mongodb';

const exportedMethods = {

    async getForumMessagesByLocationId(locationId, limit = 50) {
        locationId = validation.checkId(locationId);
        if (typeof limit !== 'number' || limit < 1) throw 'Error: limit must be a positive number';
        const forumCollection = await forums();
        const messages = await forumCollection.find({ locationId: new ObjectId(locationId) }).sort({ createdAt: -1 }).limit(limit).toArray();
        return messages;
    },

    async getMessageById(messageId) {
        messageId = validation.checkId(messageId);
        const forumCollection = await forums();
        const message = await forumCollection.findOne({ _id: new ObjectId(messageId) });
        if (!message) throw 'Error: Message not found';
        return message;
    },

    async createMessage(locationId, userId, content) {
        locationId = validation.checkId(locationId);
        userId = validation.checkId(userId);
        content = validation.checkString(content);
        if (content.trim().length > 500) throw 'Error: Message content cannot exceed 500 characters';
        const newMessage = {
            locationId: new ObjectId(locationId),
            userId: new ObjectId(userId),
            content: content.trim(),
            createdAt: new Date()
        };

        const forumCollection = await forums();
        const insertInfo = await forumCollection.insertOne(newMessage);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Error: Could not post message';
        return this.getMessageById(insertInfo.insertedId.toString());
    },


    async deleteMessage(messageId, userId) {
        messageId = validation.checkId(messageId);
        userId = validation.checkId(userId);
        const forumCollection = await forums();
        const message = await this.getMessageById(messageId);
        if (message.userId.toString() !== userId) throw 'Error: You can only delete your own messages';

        const deleteInfo = await forumCollection.deleteOne({ _id: new ObjectId(messageId) });
        if (!deleteInfo.acknowledged || deleteInfo.deletedCount === 0) throw 'Error: Could not delete message';
        return { deleted: true };
    }
};

export default exportedMethods;
