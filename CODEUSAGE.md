# MapMyCivic - Setup and Usage Guide

This repository contains the MapMyCivic app with a FastAPI backend and an Expo frontend.

1. Open the project folder

cd d:\MapMyCivic-App

2. Make sure the required tools are installed

Install Node.js and npm from https://nodejs.org/
Install Python 3.10 or higher from https://www.python.org/

Check versions:

node -v
npm -v
python --version

3. Setup the backend

Go to the backend folder:

cd backend

Create and activate a virtual environment:

python -m venv env
env\Scripts\Activate.ps1

Install Python packages:

pip install -r requirements.txt

Create a file named .env in the backend folder and fill in the values below:

DATABASE_URL=postgresql://<username>:<password>@localhost:5432/mapmycivic
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CLOUD_NAME=your-cloud-name
API_KEY=your-cloudinary-api-key
API_SECRET=your-cloudinary-api-secret

Start the backend:

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

The backend will be available at:

http://127.0.0.1:8000

Swagger docs:

http://127.0.0.1:8000/docs

4. Setup the frontend

Go to the frontend folder:

cd ..\frontend

Install frontend packages:

npm install

Start the frontend:

npm start

If you want to open it in a browser, run:

npx expo start --web

5. Frontend API URL

The frontend uses the backend URL from frontend/api/client.js.
If your backend runs on a different host or port, update the baseURL value there.

Example:

baseURL: "http://127.0.0.1:8000"

6. Common issues

If backend does not start, make sure the virtual environment is activated and the .env file has all required values.
If frontend cannot connect to backend, make sure the backend is running first.
If npm install fails, delete node_modules and package-lock.json and try again.

7. Stop the apps

Press Ctrl + C in both terminals to stop the backend and frontend.
