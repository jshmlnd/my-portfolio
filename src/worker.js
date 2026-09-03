import { Container, getContainer } from '@cloudflare/containers';

export class GameServer extends Container {
  defaultPort = 3001;
  sleepAfter = '10m';
}

export default {
  async fetch(request, env) {
    // Route all requests to the container
    // Each lobby code gets its own container instance for state isolation
    const url = new URL(request.url);

    // Use a single shared container for all game traffic
    const container = getContainer(env.GAME_SERVER, 'wordcraft-main');
    return container.fetch(request);
  },
};
