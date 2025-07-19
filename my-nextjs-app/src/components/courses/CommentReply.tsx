
'use client';
import React from 'react';
import Image from 'next/image';
import { IComment } from '@/types/course';

interface CommentReplyProps {
  reply: IComment['questionReplies'][0];
  isDark: boolean;
}

const CommentReply: React.FC<CommentReplyProps> = ({ reply, isDark }) => (
  <div className={`ml-8 mt-2 p-3 rounded-lg ${isDark ? 'bg-gray-700/80' : 'bg-gray-200/80'} shadow-sm`}>
    <div className="flex items-center gap-2 mb-1">
      <Image
        src={reply.user.avatar || '/images/admin-placeholder.jpg'}
        alt={reply.user.name}
        width={24}
        height={24}
        className="rounded-full"
      />
      <p className="text-sm font-semibold text-blue-400">{reply.user.name} {reply.user._id === 'admin' ? '(Admin)' : ''}</p>
    </div>
    <p className="text-sm">{reply.answer}</p>
  </div>
);

export default CommentReply;