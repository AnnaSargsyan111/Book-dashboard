process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.APP_URL = "http://localhost:3000";
delete process.env.RESEND_API_KEY;
delete process.env.EMAIL_FROM;
delete process.env.ANTHROPIC_API_KEY;
