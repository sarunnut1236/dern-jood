import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	// Set base for GitHub Pages deployment under repo path
	base: '/DernJoodRandomMetronome/',
});


