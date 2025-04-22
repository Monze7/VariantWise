
# 🚗 VariantWise — Your Personalized Car Consultant

**VariantWise** is an AI-powered car recommendation platform that helps users discover the perfect car **variant** tailored to their needs. Leveraging advanced machine learning and real-world insights, it simplifies the complex car selection process into a few intuitive steps.

---

## 📁 Project Structure

This monorepo is divided into three main components:

| Folder | Description |
|--------|-------------|
| `back/` | Node.js (Express) backend for authentication, sessions, and proxying. |
| `Model/` | Python (Flask) service for AI/ML-powered car recommendations and Q&A. |
| `variantwise-landing/` | Next.js frontend providing a sleek and interactive user interface. |

---

## ⚙️ Prerequisites

Make sure the following are installed/configured:

- Node.js (v16 or later)
- npm or yarn
- Python (v3.8+)
- pip
- MySQL server
- AWS account with access to Amazon Bedrock (Mistral model) and appropriate IAM permissions

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Monze7/VariantWise
cd VariantWise
```

---

### 2. Backend Setup (`back/`)

```bash
cd back
npm install
# or
yarn install
```

#### 🔐 Create `.env` File

```dotenv
# MySQL Database
DB_HOST=your_mysql_host
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_mysql_database_name
DB_PORT=3306

# Session Secret
Secret_Key=your_strong_session_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Server Settings
PORT=3001
NODE_ENV=development
```

#### 🛠 Database Setup

- Ensure your MySQL server is running.
- Create the database as specified in `.env`.
- Create necessary tables like `users` (based on `back/models/user.js`).
- *Note: Migration scripts not included.*

#### ▶️ Start Backend Server

```bash
npm start
# or
node index.js
```

Backend runs at: `http://localhost:3001`

---

### 3. Model Setup (`Model/`)

```bash
cd ../Model
pip install -r requirements.txt
```

#### 🔐 Create `.env` File

```dotenv
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
```

> Make sure the IAM user has Amazon Bedrock permissions.

#### 📂 Required Files

- Ensure `final_dataset.csv` exists in `Model/`.
- Unzip `reviews.zip` into `Model/reviews/`.

#### ▶️ Start Flask Server

```bash
python back.py
```

Model server runs at: `http://localhost:5000`

---

### 4. Frontend Setup (`variantwise-landing/`)

```bash
cd ../variantwise-landing
npm install
# or
yarn install
```

#### 🔐 Create `.env.local`

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_MODEL_URL=http://localhost:5000
```

#### ▶️ Start Frontend Server

```bash
npm run dev
# or
yarn dev
```

Frontend runs at: `http://localhost:3000`

---

## 🌐 Access the Application

Once all servers are up and running, open your browser and visit:

```
http://localhost:3000
```

You're now ready to experience AI-powered car recommendations!

---

## 📬 Feedback & Contributions

We welcome feedback and contributions! Feel free to open issues or submit PRs to make VariantWise better.

---

## 🛡 License

This project is licensed under [MIT License](LICENSE).
```
