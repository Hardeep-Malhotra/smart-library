import mongoose, { Document } from 'mongoose';
import { User } from '../user/userTypes.js';

// Use 'Document' to automatically include _id, createdAt, and updatedAt
export interface Book extends Document {
  title: string;
  slug: string; // Removed '?' because your middleware ensures it exists
  description: string;

  // If you always populate 'author', use User. If not, use ObjectId.
  author: mongoose.Types.ObjectId | User;

  genre:
    | 'Fiction'
    | 'Non-Fiction'
    | 'Education'
    | 'Programming'
    | 'Science Fiction'
    | 'Fantasy'
    | 'Biography'
    | 'History'
    | 'Children'
    | 'Other';

  coverImageUrl: string;
  file: string;

  isDeleted: boolean; // Standard practice: keep it required in interface for logic

  createdAt: Date;
  updatedAt: Date;
}
