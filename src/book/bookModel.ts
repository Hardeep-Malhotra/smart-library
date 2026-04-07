import mongoose, { Schema, Query, Model } from 'mongoose';
import { Book } from './bookTypes.js';

const bookSchema = new Schema<Book>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverImageUrl: {
      type: String,
      required: true,
      match: /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/,
    },
    file: {
      type: String,
      required: true,
      match: /^https?:\/\/.+\.(pdf|epub|mobi)$/,
    },
    genre: {
      type: String,
      required: true,
      enum: [
        'Fiction',
        'Non-Fiction',
        'Education',
        'Programming',
        'Science Fiction',
        'Fantasy',
        'Biography',
        'History',
        'Children',
        'Other',
      ],
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // 👈 Correct way to set toJSON
    toObject: { virtuals: true },
  }
);

// 🔍 TEXT SEARCH INDEX
bookSchema.index(
  { title: 'text', genre: 'text' },
  { weights: { title: 5, genre: 2 } }
);

// ⚡ COMPOUND INDEX
bookSchema.index({ author: 1, genre: 1 });

// 🧠 SLUG LOGIC (Fixed)
bookSchema.pre('save', async function () {
  if (this.isModified('title')) {
    const baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    let slug = baseSlug;
    let count = 1;

    // Use constructor to access the model to avoid circular dependency issues
    const BookModel = this.constructor as Model<Book>;

    while (await BookModel.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
});

// 🛡️ SMART SOFT DELETE FILTER (Fixed Types)
// We use a regular function (not arrow) to keep 'this' context as the Query
// 🛡️ SMART SOFT DELETE FILTER
// We use 'any' for the result type and the Book interface for the Doc type
// Replace 'any' with 'void' for the result (since it's a hook)
// and 'Book' for the document type.
bookSchema.pre(/^find/, function (this: Query<void, Book>) {
  const filter = this.getFilter();

  if (filter.isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});
export const BookModel = mongoose.model<Book>('Book', bookSchema);
