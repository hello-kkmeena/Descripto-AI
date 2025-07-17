# write a script to call an api every 30 seconds and log the response
# this script should automatic starts when app starts and stops when app stops

import os
import sys
import atexit
import threading
import requests
import time

def call_health_api():

    print("Starting health API call --------------------------------------------------------")
    while True:
        try:
            response = requests.get("https://descripto-ai-backend.onrender.com/health")
            print(f"Response {count}: {response.json()}")
            count += 1
            time.sleep(30)
        except Exception as e:
            print(e)
            time.sleep(30)

if __name__ == "__main__":
    call_health_api()


# this script should automatic starts when app starts and stops when app stops
# this script should be run in the background
# this script should be run in the background   