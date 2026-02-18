/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    tertiary: 'var(--bg-tertiary)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                },
                accent: {
                    primary: 'var(--accent-primary)',
                    secondary: 'var(--accent-secondary)',
                },
                card: {
                    bg: 'var(--card-bg)',
                    border: 'var(--card-border)',
                },
                input: {
                    bg: 'var(--input-bg)',
                },
                nav: {
                    bg: 'var(--nav-bg)',
                },
                status: {
                    success: 'var(--success)',
                    warning: 'var(--warning)',
                    error: 'var(--error)',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            borderRadius: {
                theme: 'var(--radius)',
            }
        },
    },
    plugins: [],
}
