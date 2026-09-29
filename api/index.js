// api/index.js - Vercel Serverless Function
// Ultra Fast Spam/Mute/Slide API

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
    };

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return new Response(null, { 
            status: 200, 
            headers: corsHeaders 
        });
    }

    try {
        const url = new URL(req.url);
        const pathname = url.pathname;
        
        // Format: /message/type/count
        const parts = pathname.split('/').filter(Boolean);
        
        // Help page
        if (parts.length === 0 || pathname === '/') {
            return new Response(JSON.stringify({
                name: 'Vercel Spam API',
                version: '1.0.0',
                status: 'online',
                usage: '/<message>/<type>/<count>',
                example: 'hello i m DEVIL here name to suna hoga me hu DEVIL ',
                types: ['spam', 'nc', 'mute', 'slide', 'slidespam'],
                max_count: 190000000,
                speed: 'ultra fast'
            }, null, 2), {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                }
            });
        }

        if (parts.length < 3) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid format',
                usage: '/<message>/<type>/<count>',
                example: '/hello%20hii/spam/70000',
                types: ['spam', 'nc', 'mute', 'slide', 'slidespam']
            }, null, 2), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                }
            });
        }

        const message = decodeURIComponent(parts[0]);
        const type = parts[1].toLowerCase();
        const count = Math.min(parseInt(parts[2]) || 1, 190000);

        // Valid types
        const validTypes = ['spam', 'nc', 'mute', 'slide', 'slidespam'];
        if (!validTypes.includes(type)) {
            return new Response(JSON.stringify({
                success: false,
                error: `Invalid type: ${type}`,
                valid_types: validTypes
            }, null, 2), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                }
            });
        }

        // Generate output based on type
        let output = '';
        const chunkSize = 1000;
        
        switch (type) {
            case 'spam':
                // Simple repeat
                output = Array(count).fill(message).join('\n');
                break;
                
            case 'nc':
                // Numbered
                {
                    const lines = [];
                    for (let i = 1; i <= count; i++) {
                        lines.push(`${i}. ${message}`);
                    }
                    output = lines.join('\n');
                }
                break;
                
            case 'mute':
                // Brackets
                output = Array(count).fill(`[${message}]`).join('\n');
                break;
                
            case 'slide':
                // Arrow
                output = Array(count).fill(`${message} →`).join('\n');
                break;
                
            case 'slidespam':
                // Arrow + number
                {
                    const lines = [];
                    for (let i = 1; i <= count; i++) {
                        lines.push(`${message} → ${i}`);
                    }
                    output = lines.join('\n');
                }
                break;
                
            default:
                output = Array(count).fill(message).join('\n');
        }

        // Stream response for ultra speed
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                // Send in chunks for faster response
                const totalChunks = Math.ceil(count / chunkSize);
                let sentChunks = 0;
                
                for (let i = 0; i < count; i += chunkSize) {
                    const chunkEnd = Math.min(i + chunkSize, count);
                    const chunkLines = [];
                    
                    for (let j = i; j < chunkEnd; j++) {
                        switch (type) {
                            case 'spam':
                                chunkLines.push(message);
                                break;
                            case 'nc':
                                chunkLines.push(`${j + 1}. ${message}`);
                                break;
                            case 'mute':
                                chunkLines.push(`[${message}]`);
                                break;
                            case 'slide':
                                chunkLines.push(`${message} →`);
                                break;
                            case 'slidespam':
                                chunkLines.push(`${message} → ${j + 1}`);
                                break;
                        }
                    }
                    
                    controller.enqueue(encoder.encode(chunkLines.join('\n') + '\n'));
                    sentChunks++;
                }
                
                controller.close();
            }
        });

        return new Response(stream, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'X-Total-Count': count.toString(),
                'X-Type': type,
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }, null, 2), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            }
        });
    }
                        }
