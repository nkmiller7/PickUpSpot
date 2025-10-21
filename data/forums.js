import { forums } from "../config/mongoCollections";
import validation from './validation.js';
import { ObjectId } from 'mongodb';

const exportedMethods = {
 
    async getForumMessagesByCourtId(courtId, limit = 50) {
        courtId = validation.checkId(courtId);
        
        if (typeof limit !== 'number' || limit < 1) {
        throw 'Error: limit must be a positive number';
        }

        const forumCollection = await forums();
        const messages = await forumCollection.find({ courtId: new ObjectId(courtId) }).sort({ createdAt: -1 }).limit(limit).toArray();
        return messages;
    },

    async getMessageById(messageId) {
        messageId = validation.checkId(messageId);
        const forumCollection = await forums();
        const message = await forumCollection.findOne({ _id: new ObjectId(messageId) });
        if (!message) throw 'Error: Message not found';
        return message;
    },

    async createMessage(courtId, userId, content) {
        courtId = validation.checkId(courtId);
        userId = validation.checkId(userId);

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
        throw 'Error: Message content must be a non-empty string';
        }

        if (content.trim().length > 500) {
        throw 'Error: Message content cannot exceed 500 characters';
        }

        const newMessage = {
        courtId: new ObjectId(courtId),
        userId: new ObjectId(userId),
        content: content.trim(),
        createdAt: new Date()
        };

        const forumCollection = await forums();
        const insertInfo = await forumCollection.insertOne(newMessage);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'Error: Could not post message';
        }

        return this.getMessageById(insertInfo.insertedId.toString());
    },


    async deleteMessage(messageId, userId) {
        messageId = validation.checkId(messageId);
        userId = validation.checkId(userId);

        const forumCollection = await forums();
        
        const message = await this.getMessageById(messageId);
        if (message.userId.toString() !== userId) {
        throw 'Error: You can only delete your own messages';
        }

        const deleteInfo = await forumCollection.deleteOne({ _id: new ObjectId(messageId) });
        if (!deleteInfo.acknowledged || deleteInfo.deletedCount === 0) {
        throw 'Error: Could not delete message';
        }

        return { deleted: true };
    }
};

export default exportedMethods;
