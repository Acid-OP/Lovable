import { Router } from "express";
import { Manager } from "../redisclient";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if(!prompt){
      return res.status(400).json({error: "Promot is required"});
    }
    Manager.getInstance().pushtoqueue(prompt);
    return res.status(200).json({message: "Prompt Enqueud"});
  } catch (e) {
    console.error(e);
  }
});

export default router;

