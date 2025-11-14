Todoer Backend — Node.js Microservices with AWS Integration
Overview

Todoer Backend is the core of the Todoer system.
It handles authentication, task management, and AWS-based asynchronous event processing.
Built with Node.js + Express, the backend follows a microservices architecture that keeps user and task logic independent while remaining connected through secure REST APIs and AWS event queues.

Architecture

Each service operates independently and communicates through REST endpoints and AWS components.

Frontend (React + Vercel)
        ↓
Auth Service  →  JWT Authentication
        ↓
Task Service  →  Task CRUD Operations
        ↓
AWS SNS → SQS → Lambda → DynamoDB

Service Responsibilities

Auth Service

Handles user registration, login, and JWT creation.

Connects to DynamoDB for user persistence.

Task Service

Provides task CRUD routes.

Publishes task events to AWS SNS for processing via SQS → Lambda → DynamoDB.

AWS Layer

SNS publishes task events.

SQS queues the messages.

Lambda consumes and writes data to DynamoDB.

Tech Stack
Layer	Tools
Runtime	Node.js + Express
Database	AWS DynamoDB
Messaging	AWS SNS, AWS SQS
Serverless	AWS Lambda
Auth	JSON Web Tokens (JWT)
Deployment	Render
Language	JavaScript (ES Modules)
Project Structure
todoer-backend/
├── auth-service/
│   ├── controllers/
│   │   └── authController.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── models/
│   │   └── userModel.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   └── app.js
│
├── task-service/
│   ├── controllers/
│   │   └── taskController.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── models/
│   │   └── taskModel.js
│   ├── aws/
│   │   ├── snsPublisher.js
│   │   ├── sqsConsumer.js
│   │   └── lambdaHandler.js
│   └── app.js
│
├── package.json
├── docker-compose.yml
└── README.md

Setup (Local Development)
1. Clone the Repository
git clone https://github.com/Bilaliq95/todoer-backend.git
cd todoer-backend

2. Install Dependencies
npm install

3. Set Environment Variables

Create a .env file in both auth-service and task-service.

Auth Service (.env)
PORT=3000
JWT_SECRET=your_secret_key
AWS_REGION=us-east-1
DYNAMODB_USERS_TABLE=todoer_users

Task Service (.env)
PORT=3001
AWS_REGION=us-east-1
DYNAMODB_TASKS_TABLE=todoer_tasks
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:TodoerTopic
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/TodoerQueue

4. Start Services
cd auth-service && npm start
cd ../task-service && npm start


Each service runs independently on its own port (default: 3000 and 3001).

API Reference
Auth Service
Method	Endpoint	Description	Auth
POST	/auth/register	Register a new user	Public
POST	/auth/login	Login and get JWT	Public
GET	/auth/profile	Fetch user info	Protected
Task Service
Method	Endpoint	Description	Auth
GET	/tasks	Get all tasks for user	Protected
POST	/tasks	Create a new task	Protected
PATCH	/tasks/:id	Update a task	Protected
DELETE	/tasks/:id	Delete a task	Protected

All protected routes require:

Authorization: Bearer <JWT_TOKEN>

Core Functions
Auth Service

registerUser(req, res) – Creates user, hashes password, and stores in DynamoDB.

loginUser(req, res) – Verifies credentials and returns signed JWT.

verifyToken(req, res, next) – Middleware for protected routes.

Task Service

createTask(req, res) – Adds a task and publishes event to SNS.

getTasks(req, res) – Fetches tasks by user ID from DynamoDB.

updateTask(req, res) – Updates task details.

deleteTask(req, res) – Deletes a task and publishes a delete event to SNS.

AWS Integration

snsPublisher.js – Publishes new or updated tasks to SNS topic.

sqsConsumer.js – Listens for messages from SQS for async processing.

lambdaHandler.js – Processes queued events and writes to DynamoDB.

Authentication Flow

User registers or logs in using /auth endpoints.

Backend issues a JWT stored client-side.

All requests to /tasks require Authorization: Bearer <token>.

Middleware validates the JWT before continuing.

Deployment
Render

Each service runs as a separate Render app.

Environment variables configured in Render dashboard.

Automatic deployment triggered by push to main.

AWS Components

SNS publishes messages (e.g., new task events).

SQS queues the messages.

Lambda consumes them and updates DynamoDB.
This architecture ensures reliability and scalability for background processing.

Testing
Manual Testing (Postman)

Import the collection:

/docs/todoer.postman_collection.json


Test all routes using sample payloads and tokens.

Automated Testing (Optional)

Each service can use Jest or Mocha for integration testing.

npm test

Future Improvements

Add refresh tokens for persistent login

Improve error responses and validation schema

Add CloudWatch-based monitoring

Containerize AWS components locally using LocalStack

Implement unit tests for AWS event chain

Author

Muhammad Bilal Iqbal
GitHub: Bilaliq95
