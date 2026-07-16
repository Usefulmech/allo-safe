import { Client, Account, Databases, Storage } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  console.error("Missing Appwrite environment variables. Please check your .env file.");
}

const client = new Client();
if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Constants for Database and Collections (Matching setup_db.py)
export const DB_ID = "allosafe_db";
export const COL_USERS = "users";
export const COL_TRANSACTIONS = "transactions";
export const COL_INVENTORY = "inventory";
export const COL_CONTACTS = "contacts";
export const COL_SUMMARIES = "summaries";
