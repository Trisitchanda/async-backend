import os
import json
import time
import redis
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from operations import process_operation

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017/taskplatform")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

def connect_to_redis_with_retry():
    max_retries = 10
    retry_delay = 2
    for i in range(max_retries):
        try:
            r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
            r.ping()
            print("Successfully connected to Redis.")
            return r
        except redis.ConnectionError as e:
            print(f"Redis connection failed: {e}. Retrying in {retry_delay} seconds (Attempt {i+1}/{max_retries})...")
            time.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, 30) # Exponential backoff up to 30s
    raise Exception("Failed to connect to Redis after multiple retries.")

def connect_to_mongo():
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        print("Successfully connected to MongoDB.")
        return db.tasks
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise

def main():
    print("Worker starting...")
    redis_client = connect_to_redis_with_retry()
    tasks_collection = connect_to_mongo()

    print("Worker is listening for tasks...")
    while True:
        try:
            # BLPOP blocks until an item is available in the queue
            # The timeout of 0 means it blocks indefinitely
            result = redis_client.blpop("task_queue", timeout=0)
            if not result:
                continue

            queue_name, payload_str = result
            payload = json.loads(payload_str)
            
            task_id = payload.get("taskId")
            operation = payload.get("operation")
            input_text = payload.get("input_text")
            
            print(f"Picked up task {task_id}: {operation}")
            
            # Update status to running
            tasks_collection.update_one(
                {"_id": ObjectId(task_id)},
                {"$set": {"status": "running", "logs": ["Task picked up by worker. Status changed to running."]}}
            )

            # Simulate processing time for visibility during testing
            time.sleep(2)

            # Process the operation
            process_result = process_operation(operation, input_text)
            
            # Update DB with result
            if process_result["success"]:
                final_status = "success"
            else:
                final_status = "failed"
                
            tasks_collection.update_one(
                {"_id": ObjectId(task_id)},
                {
                    "$set": {
                        "status": final_status,
                        "result": process_result["result"]
                    },
                    "$push": {
                        "logs": {"$each": process_result["logs"]}
                    }
                }
            )
            print(f"Task {task_id} completed with status {final_status}")

        except json.JSONDecodeError as e:
            print(f"Failed to decode task payload: {e}")
        except redis.ConnectionError as e:
            print(f"Redis connection lost during processing: {e}. Reconnecting...")
            redis_client = connect_to_redis_with_retry()
        except Exception as e:
            print(f"Unexpected error processing task: {e}")

if __name__ == "__main__":
    main()
