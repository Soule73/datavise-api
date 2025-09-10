import { getUploadsDir, getUploadFilePath } from '../../src/utils/uploadsPaths';

describe('Uploads Paths Utils', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
        // Restaurer l'environnement original
        process.env.NODE_ENV = originalEnv;
    });

    describe('getUploadsDir', () => {
        it('should return /tmp/uploads in production', () => {
            process.env.NODE_ENV = 'production';

            const uploadsDir = getUploadsDir();

            expect(uploadsDir).toBe('/tmp/uploads');
        });

        it('should return local uploads path in development', () => {
            process.env.NODE_ENV = 'development';

            const uploadsDir = getUploadsDir();

            expect(uploadsDir).toMatch(/uploads$/);
            expect(uploadsDir).not.toBe('/tmp/uploads');
        });

        it('should return local uploads path in test environment', () => {
            process.env.NODE_ENV = 'test';

            const uploadsDir = getUploadsDir();

            expect(uploadsDir).toMatch(/uploads$/);
            expect(uploadsDir).not.toBe('/tmp/uploads');
        });
    });

    describe('getUploadFilePath', () => {
        it('should return correct file path in production', () => {
            process.env.NODE_ENV = 'production';
            const filename = 'test-file.csv';

            const filePath = getUploadFilePath(filename);

            // Normaliser les chemins pour Windows
            expect(filePath.replace(/\\/g, '/')).toBe('/tmp/uploads/test-file.csv');
        });

        it('should return correct file path in development', () => {
            process.env.NODE_ENV = 'development';
            const filename = 'test-file.csv';

            const filePath = getUploadFilePath(filename);

            expect(filePath).toMatch(/uploads[\/\\]test-file\.csv$/);
        });

        it('should handle different file extensions', () => {
            process.env.NODE_ENV = 'production';

            expect(getUploadFilePath('data.json').replace(/\\/g, '/')).toBe('/tmp/uploads/data.json');
            expect(getUploadFilePath('spreadsheet.xlsx').replace(/\\/g, '/')).toBe('/tmp/uploads/spreadsheet.xlsx');
            expect(getUploadFilePath('document.pdf').replace(/\\/g, '/')).toBe('/tmp/uploads/document.pdf');
        });

        it('should handle filenames with special characters', () => {
            process.env.NODE_ENV = 'production';

            expect(getUploadFilePath('file with spaces.csv').replace(/\\/g, '/')).toBe('/tmp/uploads/file with spaces.csv');
            expect(getUploadFilePath('file-with-dashes.json').replace(/\\/g, '/')).toBe('/tmp/uploads/file-with-dashes.json');
            expect(getUploadFilePath('file_with_underscores.csv').replace(/\\/g, '/')).toBe('/tmp/uploads/file_with_underscores.csv');
        });
    });
});
