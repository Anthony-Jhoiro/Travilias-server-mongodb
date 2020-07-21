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

import {User} from '../models/User';
import {CustomRequest} from "../tools/types";
import {Response} from "express";

class UserController {

    async getUsersByName(req: CustomRequest, res: Response) {
        const searchItem = req.query.searchItem;
        const notFriend = req.query.notFriend;
        let user;
        let idQuery: any[] = [{_id: {$ne: req.currentUserId}}]
        if (notFriend) {
            user = await User.find({_id: req.currentUserId});

            idQuery.push({_id: {$nin: user.friends}});
        }

        return res.json(await User.find(
            {
                //@ts-ignore
                username: {$regex: searchItem, $options: 'i'},
                $and: idQuery

            }, {username: 1, _id: 1}).limit(5));
    }
}

export const userController = new UserController();
