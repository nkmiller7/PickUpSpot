/*
import {Router} from 'express';
import { forumData } from '../data/index.js';
import { userData } from '../data/index.js';
import { users } from "../config/mongoCollections.js";
import validation from '../data/validation.js';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const forum = await forumData.getMessageById(id);
    res.json(forum);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get('/locations/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id, "Location ID");
    const forumOld = await forumData.getForumMessagesByLocationId(id);
    forum = []
    for(let c of forumOld){
      let user = await userData.getUserById(c.userId);
      if(user.isAnonymous === false){
        forum.push(
          {
            userName: user.firstName+" "+user.lastName,
            content: c.content,
            createdAt: c.createdAt
          }
        )
      }else{
        forum.push(
          {
            content: c.content,
            createdAt: c.createdAt
          }
        )
      }
    }
    res.json(forum);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});
router.post('/locations/:id', async(req, res) => {
  try{
    const locationId = validation.checkId(req.params.id, "Location ID");
    const userCollection = await users();
    const user = await userCollection.findOne({email: req.session.user.email});
    if(!user){
      throw 'Error: User not found';
    }
    const userId = user._id.toString();
    const content = req.body;
    await forumData.createMessage(locationId, userId, content);

  } catch(e){
    return res.status(500).json({ error: e.message });
  }
})


export default router;
*/