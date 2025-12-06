import { createClient, RedisClientType } from "redis";

export class Manager {
    private client: RedisClientType;
    private static instance: Manager;

    private constructor() {
        this.client = createClient();
        this.client.connect();
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new Manager();
        }
        return this.instance;
    }

    createid(){
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        console.log("🆔 Generated clientId:", id);
        return id;
    }

    pushtoqueue(prompt:string){
        const id = this.createid();
        const dataToQueue = { clientId: id, prompt: prompt };
        this.client.lPush("prompt_queue", JSON.stringify(dataToQueue)).then(() => {
            console.log("prompt pushed to queue");
        }).catch((err) => {
            console.error("Failed to push to Redis queue:", err);
        });
    }
}