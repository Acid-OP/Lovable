import { Worker } from "bullmq";
import { QUEUE_NAMES } from "@repo/queue";
import {Redis} from "ioredis";

const connection = new Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null
})
const worker = new Worker(QUEUE_NAMES.PROMPT_QUEUE , 
    async(job) => {
        console.log(job.data);
    },
    {
        connection: connection
    }
);

worker.on('completed' , (job,result) => {
    console.log('Job completed:', job.id);
    console.log('Result:', result);
});

worker.on('closed', () => {
    console.log('Worker closed');
  });