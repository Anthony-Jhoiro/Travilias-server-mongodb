/*
 *
 *
 * Copyright 2020 ANTHONY QUÉRÉ
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import {Schema, model, Document} from 'mongoose';
import {UserDocument} from "./User";
import {GroupDocument} from "./Group";

export type InboxDocument = Document & {
  from: string | UserDocument;
  to: string | GroupDocument;
  sent: Date;
  body: string;
};

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  sent: {
    type: Date,
    default: Date.now
  },
  body: String
});


export const Inbox = model<InboxDocument>('Inbox', messageSchema, 'inbox');
