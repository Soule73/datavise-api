import { Express } from 'express';

export function startServer(app: Express, port: number): void {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}, url: http://localhost:${port}, environment: ${process.env.NODE_ENV || 'development'}`);
    });
} 