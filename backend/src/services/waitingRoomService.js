/**
 * Waiting Room Service
 * إدارة غرف الانتظار للمقابلات
 */

const WaitingRoom = require('../models/WaitingRoom');
const VideoInterview = require('../models/VideoInterview');
const { v4: uuidv4 } = require('uuid');

class WaitingRoomService {
  /**
   * إنشاء غرفة انتظار جديدة
   */
  async createWaitingRoom(interviewId, welcomeMessage = '') {
    try {
      const interview = await VideoInterview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      const waitingRoom = new WaitingRoom({
        roomId: `waiting-${uuidv4()}`,
        interviewId,
        welcomeMessage: welcomeMessage || 'مرحباً بك! يرجى الانتظار حتى يقبلك المضيف.',
        participants: []
      });

      await waitingRoom.save();
      return waitingRoom;
    } catch (error) {
      console.error('Error creating waiting room:', error);
      throw error;
    }
  }

  /**
   * إضافة مشارك لغرفة الانتظار
   */
  async addToWaitingRoom(interviewId, userId) {
    try {
      let waitingRoom = await WaitingRoom.findOne({ interviewId });

      // إنشاء غرفة انتظار إذا لم تكن موجودة
      if (!waitingRoom) {
        waitingRoom = await this.createWaitingRoom(interviewId);
      }

      // التحقق من عدم وجود المشارك مسبقاً
      const existingParticipant = waitingRoom.participants.find(
        p => p.userId.toString() === userId.toString()
      );

      if (existingParticipant) {
        return { waitingRoom, alreadyInRoom: true };
      }

      // إضافة المشارك
      waitingRoom.participants.push({
        userId,
        joinedAt: new Date(),
        status: 'waiting'
      });

      await waitingRoom.save();
      return { waitingRoom, alreadyInRoom: false };
    } catch (error) {
      console.error('Error adding to waiting room:', error);
      throw error;
    }
  }

  /**
   * قبول مشارك من غرفة الانتظار
   */
  async admitParticipant(interviewId, userId, hostId) {
    try {
      const interview = await VideoInterview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      // التحقق من أن المستخدم هو المضيف
      if (interview.hostId.toString() !== hostId.toString()) {
        throw new Error('Only host can admit participants');
      }

      const waitingRoom = await WaitingRoom.findOne({ interviewId });
      if (!waitingRoom) {
        throw new Error('Waiting room not found');
      }

      // البحث عن المشارك
      const participant = waitingRoom.participants.find(
        p => p.userId.toString() === userId.toString()
      );

      if (!participant) {
        throw new Error('Participant not found in waiting room');
      }

      // تحديث حالة المشارك
      participant.status = 'admitted';
      participant.admittedAt = new Date();

      await waitingRoom.save();

      // إضافة المشارك للمقابلة
      interview.participants.push({
        userId,
        role: 'participant',
        joinedAt: new Date()
      });

      await interview.save();

      return { waitingRoom, interview, participant };
    } catch (error) {
      console.error('Error admitting participant:', error);
      throw error;
    }
  }

  /**
   * رفض مشارك من غرفة الانتظار
   */
  async rejectParticipant(interviewId, userId, hostId) {
    try {
      const interview = await VideoInterview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      // التحقق من أن المستخدم هو المضيف
      if (interview.hostId.toString() !== hostId.toString()) {
        throw new Error('Only host can reject participants');
      }

      const waitingRoom = await WaitingRoom.findOne({ interviewId });
      if (!waitingRoom) {
        throw new Error('Waiting room not found');
      }

      // البحث عن المشارك
      const participant = waitingRoom.participants.find(
        p => p.userId.toString() === userId.toString()
      );

      if (!participant) {
        throw new Error('Participant not found in waiting room');
      }

      // تحديث حالة المشارك
      participant.status = 'rejected';
      participant.rejectedAt = new Date();

      await waitingRoom.save();

      return { waitingRoom, participant };
    } catch (error) {
      console.error('Error rejecting participant:', error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة المنتظرين
   */
  async getWaitingList(interviewId, hostId) {
    try {
      const interview = await VideoInterview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      // التحقق من أن المستخدم هو المضيف
      if (interview.hostId.toString() !== hostId.toString()) {
        throw new Error('Only host can view waiting list');
      }

      const waitingRoom = await WaitingRoom.findOne({ interviewId })
        .populate('participants.userId', 'name email profilePicture');

      if (!waitingRoom) {
        return { participants: [] };
      }

      // فلترة المشاركين في حالة الانتظار فقط
      const waitingParticipants = waitingRoom.participants.filter(
        p => p.status === 'waiting'
      );

      return {
        roomId: waitingRoom.roomId,
        welcomeMessage: waitingRoom.welcomeMessage,
        participants: waitingParticipants
      };
    } catch (error) {
      console.error('Error getting waiting list:', error);
      throw error;
    }
  }

  /**
   * الحصول على معلومات غرفة الانتظار للمشارك
   */
  async getWaitingRoomInfo(interviewId, userId) {
    try {
      const waitingRoom = await WaitingRoom.findOne({ interviewId });
      if (!waitingRoom) {
        throw new Error('Waiting room not found');
      }

      const participant = waitingRoom.participants.find(
        p => p.userId.toString() === userId.toString()
      );

      if (!participant) {
        throw new Error('You are not in the waiting room');
      }

      // حساب وقت الانتظار
      const waitingTime = Math.floor((Date.now() - participant.joinedAt) / 1000); // بالثواني

      // حساب عدد المنتظرين قبل هذا المشارك
      const position = waitingRoom.participants.filter(
        p => p.status === 'waiting' && p.joinedAt < participant.joinedAt
      ).length + 1;

      return {
        roomId: waitingRoom.roomId,
        welcomeMessage: waitingRoom.welcomeMessage,
        status: participant.status,
        waitingTime,
        position,
        totalWaiting: waitingRoom.participants.filter(p => p.status === 'waiting').length
      };
    } catch (error) {
      console.error('Error getting waiting room info:', error);
      throw error;
    }
  }

  /**
   * تحديث رسالة الترحيب
   */
  async updateWelcomeMessage(interviewId, hostId, welcomeMessage) {
    try {
      const interview = await VideoInterview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      // التحقق من أن المستخدم هو المضيف
      if (interview.hostId.toString() !== hostId.toString()) {
        throw new Error('Only host can update welcome message');
      }

      const waitingRoom = await WaitingRoom.findOne({ interviewId });
      if (!waitingRoom) {
        throw new Error('Waiting room not found');
      }

      waitingRoom.welcomeMessage = welcomeMessage;
      await waitingRoom.save();

      return waitingRoom;
    } catch (error) {
      console.error('Error updating welcome message:', error);
      throw error;
    }
  }

  /**
   * إزالة مشارك من غرفة الانتظار
   */
  async removeFromWaitingRoom(interviewId, userId) {
    try {
      const waitingRoom = await WaitingRoom.findOne({ interviewId });
      if (!waitingRoom) {
        return { success: true, message: 'Waiting room not found' };
      }

      waitingRoom.participants = waitingRoom.participants.filter(
        p => p.userId.toString() !== userId.toString()
      );

      await waitingRoom.save();

      return { success: true, waitingRoom };
    } catch (error) {
      console.error('Error removing from waiting room:', error);
      throw error;
    }
  }

  /**
   * حذف غرفة الانتظار
   */
  async deleteWaitingRoom(interviewId) {
    try {
      await WaitingRoom.deleteOne({ interviewId });
      return { success: true };
    } catch (error) {
      console.error('Error deleting waiting room:', error);
      throw error;
    }
  }
}

module.exports = new WaitingRoomService();
