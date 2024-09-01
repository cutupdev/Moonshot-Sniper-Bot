import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';

import { Server } from 'socket.io';

export const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);

		io.on('connection', (socket) => {
			socket.emit('newMoonshotToken', 'Client Connected', socket.id);
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
	optimizeDeps: {
		include: ['@project-serum/anchor', '@solana/web3.js', 'buffer']
		// ... use the same implementation from the SvelteKit ui
	}
});
