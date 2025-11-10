import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initPermissionsAndRoles } from '../data/initPermissions';

dotenv.config();

const connectDB = async () => {
    try {
        const environment = process.env.NODE_ENV || 'development';
        const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
            dbName: process.env.MONGO_DB_NAME || "data-vise",
        });

        const dbName = conn.connection.name || 'default';

        console.log(`Connected to MongoDB successfully, Host: ${conn.connection.host}, Database: ${dbName}, Port: ${conn.connection.port || '27017'}, Environment: ${environment}`);

        if (environment === 'development') {
            initPermissionsAndRoles().then(() => {
                console.log('Permissions and roles initialized.');
            });
        }
    } catch (error) {
        console.error(`Failed to connect to MongoDB: ${error}`);
    }
};

export default connectDB; 