// ============================================
// NETLIFY FUNCTION - PASSWORD VERIFICATION
// ============================================

export const handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: 'Method not allowed' }),
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { password } = body;

        if (!password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Password required' }),
            };
        }

        // Get the correct password from environment variable
        const correctPassword = process.env.ATTENDANCE_PASSWORD;

        if (!correctPassword) {
            console.error('ATTENDANCE_PASSWORD environment variable not set');
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Server configuration error' }),
            };
        }

        // Verify password
        if (password === correctPassword) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'Password verified',
                    token: Buffer.from(JSON.stringify({ verified: true, timestamp: Date.now() })).toString('base64'),
                }),
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: 'Invalid password' }),
            };
        }

    } catch (error) {
        console.error('Error in verify-password function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Internal server error' }),
        };
    }
};
