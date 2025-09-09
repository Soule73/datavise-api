import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
            dbName: process.env.MONGO_DB_NAME || "data-vise",
        });

        // Get database name from connection string or use default
        const dbName = conn.connection.name || 'default';

        console.log('\n' + chalk.bold('📦 MongoDB Status'));
        console.log(chalk.dim('──────────────'));
        console.log(`${chalk.green('✓')} ${chalk.bold('Status')}: ${chalk.green('Connected')}`);
        console.log(`${chalk.blue('🏢')} ${chalk.bold('Host')}: ${chalk.cyan(conn.connection.host)}`);
        console.log(`${chalk.yellow('📂')} ${chalk.bold('Database')}: ${chalk.cyan(dbName)}`);
        console.log(`${chalk.magenta('🔌')} ${chalk.bold('Port')}: ${chalk.cyan(conn.connection.port || '27017')}`);
        console.log(chalk.dim('──────────────\n'));
    } catch (error) {
        console.log('\n' + chalk.bold('📦 MongoDB Status'));
        console.log(chalk.dim('──────────────'));
        console.log(`${chalk.red('✗')} ${chalk.bold('Status')}: ${chalk.red('Failed to Connect')}`);
        console.log(`${chalk.red('❌')} ${chalk.bold('Error')}: ${chalk.red(error instanceof Error ? error.message : 'Unknown error')}`);
        console.log(chalk.dim('──────────────\n'));
        process.exit(1);
    }
};

export default connectDB; 